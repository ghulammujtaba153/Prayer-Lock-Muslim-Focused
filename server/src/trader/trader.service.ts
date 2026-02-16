import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EconomicTrends } from './interfaces/trends.interface';
import { Trend } from './schemas/trends.schema';
import { FinhubQuote } from './schemas/finhub.Schema';

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
    @InjectModel(FinhubQuote.name) private finhubQuoteModel: Model<FinhubQuote>,
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

  async getMarketQuotes() {
    const CACHE_TTL_HOURS = 1; // Cache for 1 hour matching frontend polling
    const now = new Date();

    try {
      // 1. Check if we have fresh cached data for all symbols
      const cachedQuotes = await this.finhubQuoteModel.find({}).exec();
      
      if (cachedQuotes.length > 0) {
        // Check if all caches are fresh (within 1 hour)
        const allFresh = cachedQuotes.every((quote) => {
          const quoteAge = (now.getTime() - new Date(quote.timestamp).getTime()) / (1000 * 60 * 60);
          return quoteAge < CACHE_TTL_HOURS;
        });

        if (allFresh && cachedQuotes.length >= 7) { // We expect 7 assets
          this.logger.log('Returning cached market quotes from MongoDB');
          const quotes = {};
          cachedQuotes.forEach((quote) => {
            const symbolName = this.getSymbolName(quote.symbol);
            quotes[symbolName] = {
              symbol: quote.symbol,
              price: quote.price,
              change: quote.change,
              percentChange: quote.percentChange,
              high: quote.high,
              low: quote.low,
              open: quote.open,
              previousClose: quote.previousClose,
            };
          });
          return quotes;
        }
      }

      this.logger.log('Cache is stale or incomplete, fetching from external APIs...');

      // 2. Fetch fresh data from external APIs
      const finhubKey = this.configService.get<string>('FINHUB_API_KEY');
      const commodityKey = this.configService.get<string>('COMMODITY_API_KEY');
      const twelveDataKey = this.configService.get<string>('TWELVE_DATA_API_KEY');

      if (!finhubKey) throw new Error('Finnhub API key not configured');
      if (!commodityKey) throw new Error('Commodity API key not configured');
      if (!twelveDataKey) throw new Error('Twelve Data API key not configured');

      const quotes = {};

      // Fetch BTC from Finnhub
      try {
        const btcData = await this.fetchFinnhubQuote('BINANCE:BTCUSDT', finhubKey);
        if (btcData) {
          quotes['BTC'] = {
            symbol: 'BINANCE:BTCUSDT',
            price: btcData.c,
            change: btcData.d,
            percentChange: btcData.dp,
            high: btcData.h,
            low: btcData.l,
            open: btcData.o,
            previousClose: btcData.pc,
          };
        }
      } catch (error) {
        this.logger.error('Finnhub BTC fetch failed:', error.message);
      }

      // Fetch indices from Twelve Data API
      const twelveDataSymbols = {
        NASDAQ: 'QQQ',
        DOW_JONES: 'DIA',
        SP500: 'SPY',
      };

      await Promise.all(
        Object.entries(twelveDataSymbols).map(async ([name, symbol]) => {
          try {
            const data = await this.fetchTwelveDataQuote(symbol, twelveDataKey);
            if (data) {
              quotes[name] = {
                symbol,
                price: parseFloat(data.close),
                change: parseFloat(data.change),
                percentChange: parseFloat(data.percent_change),
                high: parseFloat(data.high),
                low: parseFloat(data.low),
                open: parseFloat(data.open),
                previousClose: parseFloat(data.previous_close),
              };
            }
          } catch (error) {
            this.logger.error(`Twelve Data ${name} fetch failed:`, error.message);
          }
        }),
      );

      // Fetch commodities from Commodity Price API
      const commoditySymbols = {
        GOLD: 'XAU',
        SILVER: 'XAG',
        CRUDE_OIL: 'WTIOIL-FUT',
      };

      try {
        const commodityData = await this.fetchCommodityPrices(
          Object.values(commoditySymbols).join(','),
          commodityKey,
        );

        if (commodityData?.rates) {
          Object.entries(commoditySymbols).forEach(([name, symbol]) => {
            const price = commodityData.rates[symbol];
            if (price) {
              quotes[name] = {
                symbol,
                price: parseFloat(price.toFixed(2)),
                change: null,
                percentChange: null,
                high: null,
                low: null,
                open: null,
                previousClose: null,
              };
            }
          });
        }
      } catch (error) {
        this.logger.error('Commodity API fetch failed:', error.message);
      }

      // 3. Save all quotes to MongoDB (upsert)
      await Promise.all(
        Object.entries(quotes).map(async ([name, quoteData]: [string, any]) => {
          try {
            await this.finhubQuoteModel.findOneAndUpdate(
              { symbol: quoteData.symbol },
              {
                symbol: quoteData.symbol,
                price: quoteData.price,
                change: quoteData.change || 0,
                percentChange: quoteData.percentChange || 0,
                high: quoteData.high || 0,
                low: quoteData.low || 0,
                open: quoteData.open || 0,
                previousClose: quoteData.previousClose || 0,
                timestamp: now,
              },
              { upsert: true, new: true },
            );
          } catch (error) {
            this.logger.error(`Failed to cache ${name} quote:`, error.message);
          }
        }),
      );

      this.logger.log('Market quotes fetched and cached successfully');
      return quotes;
    } catch (error) {
      this.logger.error('Error in getMarketQuotes:', error.message);
      throw error;
    }
  }

  private getSymbolName(symbol: string): string {
    const symbolMap = {
      'BINANCE:BTCUSDT': 'BTC',
      'QQQ': 'NASDAQ',
      'DIA': 'DOW_JONES',
      'SPY': 'SP500',
      'XAU': 'GOLD',
      'XAG': 'SILVER',
      'WTIOIL-FUT': 'CRUDE_OIL',
    };
    return symbolMap[symbol] || symbol;
  }

  private async fetchTwelveDataQuote(symbol: string, apiKey: string) {
    try {
      const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`;
      const res = await firstValueFrom(this.httpService.get(url));
      return res.data;
    } catch (e) {
      this.logger.error('Twelve Data API error:', e.message);
      return null;
    }
  }

  private async fetchCommodityPrices(symbols: string, apiKey: string) {
    try {
      const url = `https://api.commoditypriceapi.com/v2/rates/latest?symbols=${symbols}`;
      const res = await firstValueFrom(
        this.httpService.get(url, {
          headers: { 'x-api-key': apiKey },
        }),
      );
      return res.data;
    } catch (e) {
      this.logger.error('Commodity API error:', e.message);
      return null;
    }
  }
}
