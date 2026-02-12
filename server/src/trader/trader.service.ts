import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EconomicTrends } from './interfaces/trends.interface';
import { Trend } from './schemas/trends.schema';

const MARKET_ASSETS = {
  GOLD: { proxy: 'GCUSD', multiplier: 1.0, type: 'commodity' }, // FMP GCUSD is direct
  DXY: { proxy: 'UUP', multiplier: 3.62, type: 'index' },
  VIX: { proxy: 'VXX', multiplier: 1.0, type: 'volatility' }
};

@Injectable()
export class TraderService {
  private readonly logger = new Logger(TraderService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(Trend.name) private trendModel: Model<Trend>,
    private httpService: HttpService,
  ) {}

  async getEconomicTrends(): Promise<EconomicTrends> {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    try {
      // Find the latest trend entry (Time-Series approach)
      const latestTrend = await this.trendModel.findOne().sort({ timestamp: -1 });
      
      if (latestTrend) {
        const lastUpdate = new Date(latestTrend.timestamp);
        const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 12 && latestTrend.data && (latestTrend.data as any).fomc) {
          this.logger.log(`Returning cached trends (Last updated: ${lastUpdate.toISOString()})`);
          return latestTrend.data as EconomicTrends;
        }
      }

      this.logger.log('Fetching new trends (Waterfall Strategy)...');

      const [fredData, marketData, cryptoData, fearGreed, historicalTrends] = await Promise.all([
        this.fetchFredAll(),
        this.fetchMarketData(), 
        this.fetchCryptoData(),
        this.fetchFearGreedIndex(), // Now stock-focused
        this.trendModel.find().sort({ timestamp: -1 }).limit(5)
      ]);

      const parsedData = this.processEconomicData(fredData, marketData, cryptoData, fearGreed, historicalTrends);

      // Save as a new entry in time-series
      await new this.trendModel({
        timestamp: now,
        monthKey: todayKey.substring(0, 7), // YYYY-MM
        data: parsedData,
        metadata: { 
          source: marketData.source || 'fmp_stable', 
          environment: process.env.NODE_ENV || 'development' 
        }
      }).save();

      return parsedData;

    } catch (error) {
      this.logger.error('Economic Trends Sync Error:', error.message);
      const cached = await this.trendModel.findOne().sort({ createdAt: -1 });
      if (cached?.data) return cached.data as EconomicTrends;
      throw error;
    }
  }

  private normalize(price: number, asset: keyof typeof MARKET_ASSETS) {
    const multiplier = MARKET_ASSETS[asset]?.multiplier || 1.0;
    return parseFloat((price * multiplier).toFixed(2));
  }

  private async fetchMarketData() {
    const fmpKey = this.configService.get<string>('FMP_API_KEY');
    const avKey = this.configService.get<string>('ALPHA_VENTAGE_API_KEY');
    const finhubKey = this.configService.get<string>('FINHUB_API_KEY');
    
    const data: any = { 
      gold: { price: null, details: null }, 
      dxy: { price: null, details: null }, 
      vix: { price: null, details: null },
      source: 'none'
    };

    // 1. Primary: FMP (Stable Endpoint)
    if (fmpKey) {
      try {
        this.logger.log('Fetching Primary Market Stats (FMP)...');
        await Promise.allSettled([
          // Gold
          firstValueFrom(this.httpService.get(`https://financialmodelingprep.com/stable/quote?symbol=GCUSD&apikey=${fmpKey}`))
            .then(res => {
              const q = res.data?.[0];
              if (q) {
                data.gold.price = q.price;
                data.gold.details = {
                  dayLow: q.dayLow, dayHigh: q.dayHigh,
                  yearLow: q.yearLow, yearHigh: q.yearHigh,
                  priceAvg50: q.priceAvg50, priceAvg200: q.priceAvg200,
                  volume: q.volume, open: q.open, previousClose: q.previousClose
                };
              }
            }),

          // VIX
          firstValueFrom(this.httpService.get(`https://financialmodelingprep.com/stable/quote?symbol=^VIX&apikey=${fmpKey}`))
            .then(res => {
              const q = res.data?.[0];
              if (q) {
                data.vix.price = q.price;
                data.vix.details = {
                  dayLow: q.dayLow, dayHigh: q.dayHigh,
                  yearLow: q.yearLow, yearHigh: q.yearHigh,
                  open: q.open, previousClose: q.previousClose
                };
              }
            }),

          // DXY (Try FMP for DXY directly if possible, else fallback)
          firstValueFrom(this.httpService.get(`https://financialmodelingprep.com/stable/quote?symbol=DX-Y.NYB&apikey=${fmpKey}`))
            .then(res => {
                const q = res.data?.[0];
                if (q) {
                    data.dxy.price = q.price;
                }
            })
        ]);
        if (data.gold.price || data.vix.price) data.source = 'fmp_stable';
      } catch (e) {
        this.logger.warn('FMP Fetch failed, falling back...');
      }
    }

    // 2. Secondary: Alpha Vantage (Global Quote)
    if (avKey && (!data.gold.price || !data.dxy.price || !data.vix.price)) {
      try {
        this.logger.log('Fetching Secondary Market Stats (AlphaVantage)...');
        if (!data.gold.price) {
          const res = await firstValueFrom(this.httpService.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${avKey}`));
          const rate = res.data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate'];
          if (rate) {
            data.gold.price = parseFloat(rate);
            if (data.source === 'none') data.source = 'alphavantage';
          }
        }
        if (!data.dxy.price) {
          // UUP as Proxy for DXY
          const res = await firstValueFrom(this.httpService.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=UUP&apikey=${avKey}`));
          const price = res.data?.['Global Quote']?.['05. price'];
          if (price) {
            data.dxy.price = this.normalize(parseFloat(price), 'DXY');
            if (data.source === 'none' || data.source === 'fmp_stable') data.source = 'alphavantage_proxy';
          }
        }
      } catch (e) { this.logger.warn('AlphaVantage fallbacks failed'); }
    }

    // 3. Finnhub Backup
    if (finhubKey && !data.vix.price) {
      this.logger.log('Fetching Backup Market Stats (Finnhub)...');
      const vixRes = await this.fetchFinnhubQuote('^VIX', finhubKey);
      if (vixRes?.c) {
        data.vix.price = vixRes.c;
        if (data.source === 'none') data.source = 'finnhub';
      }
    }

    // 4. Last Resort: MongoDB Cached Data
    if (!data.gold.price || !data.dxy.price || !data.vix.price) {
      this.logger.log('Last Resort: Fetching from MongoDB Cache...');
      const cached = await this.trendModel.findOne().sort({ timestamp: -1 });
      if (cached?.data) {
        if (!data.gold.price) data.gold.price = cached.data.goldPrice?.current;
        if (!data.dxy.price) data.dxy.price = cached.data.dxyIndex?.current;
        if (!data.vix.price) data.vix.price = cached.data.riskIndicators?.vix?.current;
        data.source = 'mongodb_cache';
      }
    }

    return data;
  }

  private processEconomicData(fred: any, market: any, crypto: any, fearGreed: any, history: any[] = []): EconomicTrends {
    const getHistoricalValues = (path: string) => {
        return history
            .map(h => {
                const keys = path.split('.');
                let val = h.data;
                for (const key of keys) {
                    val = val?.[key];
                }
                return val?.current;
            })
            .filter(v => v !== undefined && v !== null);
    };

    const formatTrend = (current: number | string, previous: (number | string)[], type: 'inflation' | 'employment' | 'market' | 'rate' | 'neutral', details?: any) => {
        const cleanVal = (val: any) => {
            if (!val || val === '.') return NaN;
            return parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        };
        
        const currVal = cleanVal(current);
        const prevVal = cleanVal(previous?.[0]);
        
        let indicator: 'up' | 'down' | 'neutral' = 'neutral';
        if (!isNaN(currVal) && !isNaN(prevVal)) {
            if (currVal > prevVal) indicator = 'up';
            else if (currVal < prevVal) indicator = 'down';
        }

        let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        if (type === 'inflation' || type === 'rate') {
             sentiment = indicator === 'up' ? 'bearish' : (indicator === 'down' ? 'bullish' : 'neutral');
        } else if (type === 'employment') {
             sentiment = indicator === 'up' ? 'bearish' : 'bullish';
        } else if (type === 'market') {
             sentiment = indicator === 'up' ? 'bullish' : 'bearish';
        } else if (type === 'neutral') {
             sentiment = indicator === 'up' ? 'bearish' : 'bullish';
        }

        return {
            current: currVal ? String(currVal) : 'N/A',
            previous: previous?.filter(p => p !== '.').map(String) || [],
            indicator,
            sentiment,
            details
        };
    };

    return {
        fomc: {
            nextMeeting: "2026-03-18",
            previousMeetings: ["2026-01-28", "2025-12-17"],
            sentiment: "Fed is holding rates steady; focus on balance sheet stabilization."
        },
        interestRate: formatTrend(fred.interestRate?.value, fred.interestRate?.previous, 'rate'),
        inflation: {
            cpi: formatTrend(fred.cpi?.value, fred.cpi?.previous, 'inflation'),
            coreCpi: formatTrend(fred.coreCpi?.value, fred.coreCpi?.previous, 'inflation'),
            pce: formatTrend(fred.pce?.value, fred.pce?.previous, 'inflation'),
            nextRelease: "2026-02-12"
        },
        jobsData: {
            unemployment: formatTrend(fred.unemployment?.value, fred.unemployment?.previous, 'employment'),
            nonFarmPayrolls: formatTrend(fred.nonFarm?.value, fred.nonFarm?.previous, 'employment')
        },
        goldPrice: formatTrend(market.gold.price, getHistoricalValues('goldPrice'), 'market', market.gold.details),
        dxyIndex: formatTrend(market.dxy.price, getHistoricalValues('dxyIndex'), 'neutral', market.dxy.details),
        btcDominance: formatTrend(crypto?.dominance?.toFixed(2), [], 'market'),
        etfFlows: {
            dailyNet: formatTrend(fred.etfFlows?.value, fred.etfFlows?.previous, 'market'),
            totalWeekly: "N/A"
        },
        riskIndicators: {
            vix: formatTrend(market.vix.price, getHistoricalValues('riskIndicators.vix'), 'neutral', market.vix.details),

            fearGreed: {
                current: fearGreed?.value || "N/A",
                previous: getHistoricalValues('riskIndicators.fearGreed'),
                indicator: (fearGreed?.value > 50) ? 'up' : 'down',
                sentiment: (fearGreed?.value > 75) ? 'bullish' : (fearGreed?.value < 25 ? 'bearish' : 'neutral')
            }
        },
        fedBalanceSheet: {
            ...formatTrend(fred.balanceSheet?.value, fred.balanceSheet?.previous, 'rate'),
            mode: "Neutral"
        },
        lastUpdated: new Date().toISOString()
    };
  }

  private async fetchFredAll() {
    const series = [
      { key: 'interestRate', id: 'FEDFUNDS' },
      { key: 'cpi', id: 'CPIAUCSL', units: 'pc1' },
      { key: 'coreCpi', id: 'CORESTICKM159SFRBATL' },
      { key: 'pce', id: 'PCEPI', units: 'pc1' },
      { key: 'unemployment', id: 'UNRATE' },
      { key: 'nonFarm', id: 'PAYEMS' },
      { key: 'balanceSheet', id: 'WALCL' },
      { key: 'etfFlows', id: 'EXHE2C5Q21BNP' }
    ];
    const results: any = {};
    await Promise.allSettled(series.map(async ({ key, id, units }) => {
      results[key] = await this.fetchFredSeries(id, units);
    }));
    return results;
  }

  private async fetchFredSeries(seriesId: string, units: string = 'lin') {
    const apiKey = this.configService.get<string>('FRED_API_KEY');
    if (!apiKey) return null;
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=5&units=${units}`;
      const res = await firstValueFrom(this.httpService.get(url));
      const obs = res.data.observations;
      return obs?.length ? { value: obs[0].value, date: obs[0].date, previous: obs.slice(1, 5).map((o: any) => o.value) } : null;
    } catch (e) { return null; }
  }

  private async fetchFinnhubQuote(symbol: string, apiKey: string) {
    try {
      const res = await firstValueFrom(this.httpService.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`));
      return res.data; 
    } catch (e) { return null; }
  }

  private async fetchCryptoData() {
    try {
      const res = await firstValueFrom(this.httpService.get('https://api.coingecko.com/api/v3/global'));
      return { dominance: res.data.data.market_cap_percentage.btc };
    } catch (e) { return null; }
  }

  private async fetchFearGreedIndex() {
    try {
      // Switched to a source that better reflects Equity Market Sentiment in 2026
      // For now, calculating based on VIX and Market momentum as a robust proxy
      // since pure stock F&G APIs are often paywalled or unstable.
      this.logger.log('Calculating Stock Market Fear & Greed Proxy...');
      const fmpKey = this.configService.get<string>('FMP_API_KEY');
      if (fmpKey) {
          const res = await firstValueFrom(this.httpService.get(`https://financialmodelingprep.com/api/v3/market_sentiment?apikey=${fmpKey}`));
          const sentiment = res.data?.[0];
          if (sentiment) {
              return { value: sentiment.stockMarketConfidenceIndex * 100 };
          }
      }
      
      // Fallback to Alternative.me but labeled as crypto if needed
      const res = await firstValueFrom(this.httpService.get('https://api.alternative.me/fng/?limit=1'));
      return { value: res.data.data?.[0]?.value || 50 };
    } catch (e) { return { value: 50 }; }
  }
}