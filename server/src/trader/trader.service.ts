import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EconomicTrends } from './interfaces/trends.interface';
import { Trend } from './schemas/trends.schema';

@Injectable()
export class TraderService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(Trend.name) private trendModel: Model<Trend>,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: 'application/json' },
    });
  }

  async getEconomicTrends(): Promise<EconomicTrends> {
    const now = new Date();
    const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dateStr = now.toDateString();

    try {
      // 1. Force cleanup: Delete any records using the old month-only format (YYYY-MM)
      await this.trendModel.deleteMany({
        $expr: { $lt: [{ $strLenCP: '$monthKey' }, 10] },
      });

      const cachedTrend = await this.trendModel.findOne({ monthKey: dayKey });
      if (cachedTrend && cachedTrend.data && (cachedTrend.data as any).fomc) {
        console.log(`[TraderService] Returning cached trends for ${dayKey}`);
        return cachedTrend.data as EconomicTrends;
      }

      // If we didn't find dayKey, check if there's any record that is missing 'fomc' and delete it to prevent confusion
      await this.trendModel.deleteMany({ 'data.fomc': { $exists: false } });

      console.log(
        `[TraderService] Fetching new trends from Gemini for ${dayKey}`,
      );

      const prompt = `Today's date is ${dateStr}. You are a high-precision financial data analyst. 
Return a strictly valid JSON object containing the 10 Key Fundamental Indicators for financial traders. 

### DATA INTEGRITY RULES:
1. USE REAL-TIME DATA: Provide the most recent actual figures available as of ${dateStr}.
2. NO HALLUCINATIONS: If a specific "previous" value is unavailable, use "N/A" rather than inventing a number or using old 2024 data.
3. TREND LOGIC: 'indicator' ('up'|'down'|'neutral') must compare 'current' to the immediate most recent value in the 'previous' array.
4. SENTIMENT LOGIC: 'sentiment' ('bullish'|'bearish'|'neutral') must reflect the impact on RISK ASSETS (Equities/Crypto). (e.g., High Inflation = Bearish).
5. FORMATTING: Use raw numbers (strings) for values (e.g., "75.2B" or "3.4%").

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

      const result = await (this.model as any).generateContent(prompt);
      const response = await (result as any).response;
      const text: string = (response as any).text();
      const parsedData = JSON.parse(text) as EconomicTrends;

      // 2. Save fetched data to DB
      await this.trendModel.findOneAndUpdate(
        { monthKey: dayKey },
        { data: parsedData },
        { upsert: true, new: true },
      );

      return parsedData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Economic Trends Error:', errorMessage);
      throw new Error(`Economic Trends API failed: ${errorMessage}`);
    }
  }
}
