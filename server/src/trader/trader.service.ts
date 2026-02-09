import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EconomicTrends } from './interfaces/trends.interface';
import { Trend } from './schemas/trends.schema';

@Injectable()
export class TraderService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(Trend.name) private trendModel: Model<Trend>,
    private httpService: HttpService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash', 
      tools: [
        {
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: 'MODE_DYNAMIC' as any,
              dynamicThreshold: 0.7,
            },
          },
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });
  }

  async getEconomicTrends(): Promise<EconomicTrends> {
    const now = new Date();
    const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dateStr = now.toDateString();

    try {
      // 1. Cleanup old data
      await this.trendModel.deleteMany({
        $expr: { $lt: [{ $strLenCP: '$monthKey' }, 10] },
      });

      // 2. Check Cache
      const cachedTrend = await this.trendModel.findOne({ monthKey: dayKey });
      if (cachedTrend && cachedTrend.data && (cachedTrend.data as any).fomc) {
        console.log(`[TraderService] Returning cached trends for ${dayKey}`);
        return cachedTrend.data as EconomicTrends;
      }

      await this.trendModel.deleteMany({ 'data.fomc': { $exists: false } });

      console.log(`[TraderService] Fetching new trends from Real APIs for ${dayKey}`);

      // 3. Fetch Real Data in Parallel
      const [
        interestRate,
        cpi,
        pce,
        unemployment,
        nonFarm,
        cryptoData,
        fearGreed,
      ] = await Promise.allSettled([
        this.fetchFredData('FEDFUNDS'),
        this.fetchFredData('CPIAUCSL'),
        this.fetchFredData('PCEPI'),
        this.fetchFredData('UNRATE'),
        this.fetchFredData('PAYEMS'),
        this.fetchCryptoData(),
        this.fetchFearGreedIndex(),
      ]);

      // Helper to extract value or N/A
      const getValue = (result: PromiseSettledResult<any>) =>
        result.status === 'fulfilled' ? result.value : 'N/A';

      const realDataContext = {
        interestRate: getValue(interestRate),
        cpi: getValue(cpi),
        pce: getValue(pce),
        unemployment: getValue(unemployment),
        nonFarmPayrolls: getValue(nonFarm),
        btcDominance: getValue(cryptoData)?.dominance || 'N/A',
        btcPrice: getValue(cryptoData)?.price || 'N/A',
        fearGreedIndex: getValue(fearGreed),
      };

      console.log('[TraderService] Real Data Context:', JSON.stringify(realDataContext, null, 2));

      // 4. Use Gemini for Sentiment & Formatting (with Retry)
      const prompt = `
      Today's date is ${dateStr}. You are a high-precision financial data analyst.
      
      Here is the REAL-TIME data fetched from official APIs (FRED, CoinGecko, etc.):
      ${JSON.stringify(realDataContext, null, 2)}

      Your task:
      1. **PRIORITIZE REAL DATA**: Use the values provided in the context above as the primary source of truth.
      2. **SEARCH FALLBACK**: ONLY if a specific value is "N/A" or missing (e.g., Gold Price, DXY, ETF Flows, specific FOMC dates), use Google Search to find the latest accurate figure.
      3. **NO HALLUCINATIONS**: If search fails for a missing value, mark it clearly as "N/A". Do not invent numbers.
      4. **SENTIMENT**: Analyze the "sentiment" (bullish/bearish/neutral) and "indicator" (up/down/neutral) based on the data changes.

      ### JSON STRUCTURE (MUST FOLLOW EXACTLY):
      {
        "fomc": { 
          "nextMeeting": "string (YYYY-MM-DD)", 
          "previousMeetings": ["string", "string", "string"], 
          "sentiment": "string (brief market impact explanation)" 
        },
        "interestRate": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" },
        "inflation": {
          "cpi": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" },
          "coreCpi": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" },
          "pce": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" },
          "nextRelease": "string"
        },
        "jobsData": {
          "unemployment": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" },
          "nonFarmPayrolls": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" }
        },
        "goldPrice": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" },
        "dxyIndex": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" },
        "btcDominance": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" },
        "etfFlows": {
          "dailyNet": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" },
          "totalWeekly": "string"
        },
        "riskIndicators": {
          "vix": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" },
          "fearGreed": { "current": "string", "previous": ["string", "string", "string"], "indicator": "up|down|neutral", "sentiment": "bullish|bearish|neutral" }
        },
        "fedBalanceSheet": {
          "current": "string",
          "previous": ["string", "string", "string"],
          "indicator": "up|down|neutral",
          "sentiment": "bullish|bearish|neutral",
          "mode": "QE|QT|Neutral"
        },
        "lastUpdated": "string (ISO Timestamp)"
      }`;

      const parsedData = await this.generateWithRetry(prompt);

      // 5. Save fetched data to DB
      await this.trendModel.findOneAndUpdate(
        { monthKey: dayKey },
        { data: parsedData },
        { upsert: true, new: true },
      );

      return parsedData;

    } catch (error) {
      console.error('Economic Trends API Error:', error);
      // Fallback Strategy: Return cache if available (even if partial/old)
      const cachedTrend = await this.trendModel.findOne({ monthKey: dayKey });
      if (cachedTrend?.data) {
         console.log('[TraderService] API failed, returning stale/cached data.');
         return cachedTrend.data as EconomicTrends;
      }
      throw new Error(`Economic Trends API failed completely: ${error instanceof Error ? error.message : error}`);
    }
  }

  private async generateWithRetry(prompt: string, retries = 2): Promise<EconomicTrends> {
    for (let i = 0; i <= retries; i++) {
        try {
            const result = await (this.model as any).generateContent(prompt);
            const response = await (result as any).response;
            const text = (response as any).text();
            
            // Validate JSON
            let parsed: EconomicTrends;
            try {
                // Remove code blocks if present
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                parsed = JSON.parse(cleanText);
            } catch (e) {
                throw new Error("Invalid JSON format from Gemini");
            }
            
            // Basic schema check
            if (!parsed.fomc || !parsed.interestRate) {
                throw new Error("Missing required fields in Gemini response");
            }
            return parsed;
        } catch (err) {
            console.warn(`[TraderService] Attempt ${i + 1} failed: ${err}`);
            if (i === retries) throw err;
        }
    }
    throw new Error("Max retries exceeded");
  }

  private async fetchFredData(seriesId: string): Promise<any> {
    const apiKey = this.configService.get<string>('FRED_API_KEY');
    if (!apiKey) return null;

    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=5`;
      const response = await firstValueFrom(this.httpService.get(url));
      const observations = response.data.observations;
      
      if (!observations || observations.length === 0) return null;

      return {
        current: observations[0].value,
        previous: observations.slice(1).map((o: any) => o.value),
        lastUpdated: observations[0].date
      };
    } catch (error) {
      console.warn(`[TraderService] Failed to fetch FRED series ${seriesId}:`, error.message);
      return null;
    }
  }

  private async fetchCryptoData(): Promise<any> {
    try {
        // CoinGecko Global API (Free)
        const url = 'https://api.coingecko.com/api/v3/global';
        const response = await firstValueFrom(this.httpService.get(url));
        const data = response.data.data;
        
        return {
            dominance: data.market_cap_percentage.btc ? `${data.market_cap_percentage.btc.toFixed(2)}%` : 'N/A',
            // To get BTC price we need another call, but let's stick to dominance here or adding a simple price call if specific logic needed
        };
    } catch (error) {
        console.warn(`[TraderService] Failed to fetch CoinGecko data:`, error.message);
        return null;
    }
  }

  private async fetchFearGreedIndex(): Promise<any> {
    try {
        const url = 'https://api.alternative.me/fng/?limit=5';
        const response = await firstValueFrom(this.httpService.get(url));
        const data = response.data.data;
        
        if (!data || data.length === 0) return null;

        return {
            current: data[0].value,
            previous: data.slice(1).map((d: any) => d.value),
            classification: data[0].value_classification
        };
    } catch (error) {
        console.warn(`[TraderService] Failed to fetch Fear & Greed Index:`, error.message);
        return null;
    }
  }
}
