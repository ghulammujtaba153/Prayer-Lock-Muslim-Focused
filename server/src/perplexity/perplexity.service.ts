import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Perplexity } from './schemas/perplexity.schema';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';

type FredStats = {
  rate: string | null;
  jobs: string | null;
  assets: string | null;
};

type PerplexityStats = {
  ITEM1: string | null;
  ITEM2: string | null;
  ITEM3: string | null;
  ITEM4: string | null;
  ITEM5: string | null;
  ITEM6: string | null;
  ITEM7: string | null;
  ITEM8: string | null;
  ITEM9: string | null;
  ITEM10: string | null;
};

type FinalStats = {
  fomc_dates: string;
  interest_rate_us: string;
  inflation: string;
  jobs_data: string;
  gold_price: string;
  dxy_dollar: string;
  btc_dominance: string;
  etf_flows: string;
  vix_fear_greed: string;
  fed_balance_sheet: string;
};

@Injectable()
export class PerplexityService {
  private readonly logger = new Logger(PerplexityService.name);

  constructor(
    @InjectModel(Perplexity.name)
    private readonly perplexityModel: Model<Perplexity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Runs at 08:00 and 20:00 every day
  @Cron('0 8,20 * * *')
  async handleCron(): Promise<void> {
    this.logger.debug('Starting cron-based Market data sync...');
    try {
      await this.syncData();
    } catch (error) {
      this.logger.error('Cron market data sync failed', (error as Error).message);
    }
  }

  async syncData(): Promise<FinalStats> {
    this.logger.log('Starting hybrid market data sync (FRED + Perplexity)...');

    // FETCH FRED (Interest, Jobs, Balance Sheet)
    let fred: FredStats = { rate: null, jobs: null, assets: null };
    try {
      fred = await this.getFredStats();
    } catch (e) {
      this.logger.error('FRED sync failed', (e as Error).message);
    }

    // FETCH PERPLEXITY (FOMC, Gold, DXY, Inflation, BTC.D, ETFs, Greed)
    let pplx: PerplexityStats = {
      ITEM1: null,
      ITEM2: null,
      ITEM3: null,
      ITEM4: null,
      ITEM5: null,
      ITEM6: null,
      ITEM7: null,
      ITEM8: null,
      ITEM9: null,
      ITEM10: null,
    };

    try {
      pplx = await this.getPerplexityStats();
    } catch (e) {
      this.logger.error('Perplexity sync failed', (e as Error).message);
    }

    const merge = (val1: string | null, val2: string | null): string => {
      const isBad = (v: string | null) =>
        !v ||
        v === 'N/A' ||
        v.toLowerCase().includes('unavailable') ||
        v.toLowerCase().includes('no data') ||
        v.trim().length === 0;

      if (!isBad(val1)) return val1 as string;
      if (!isBad(val2)) return val2 as string;
      return 'N/A';
    };

    const finalStats: FinalStats = {
      fomc_dates: merge(pplx.ITEM1, null),
      interest_rate_us: merge(fred.rate, pplx.ITEM2),
      inflation: merge(pplx.ITEM3, null),
      jobs_data: merge(fred.jobs, pplx.ITEM4),
      gold_price: merge(pplx.ITEM5, null),
      dxy_dollar: merge(pplx.ITEM6, null),
      btc_dominance: merge(pplx.ITEM7, null),
      etf_flows: merge(pplx.ITEM8, null),
      vix_fear_greed: merge(pplx.ITEM9, null),
      fed_balance_sheet: merge(fred.assets, pplx.ITEM10),
    };

    await new this.perplexityModel({
      query: 'Hybrid Sync',
      response: JSON.stringify(finalStats),
    }).save();

    this.logger.log('Market data sync complete.');
    return finalStats;
  }

  private async getFredStats(): Promise<FredStats> {
    const apiKey = this.configService.get<string>('FRED_API_KEY');
    if (!apiKey) {
      this.logger.warn('FRED_API_KEY not configured, skipping FRED stats.');
      return { rate: null, jobs: null, assets: null };
    }

    const fetchOne = async (id: string): Promise<string | null> => {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
      try {
        const res = await firstValueFrom(this.httpService.get(url));
        const value = res.data?.observations?.[0]?.value;
        return value && value !== '.' ? value : null;
      } catch (error) {
        this.logger.error(`FRED fetch failed for ${id}`, (error as Error).message);
        return null;
      }
    };

    const [rateRaw, jobsRaw, assetsRaw] = await Promise.all([
      fetchOne('FEDFUNDS'), // Fed Funds rate
      fetchOne('UNRATE'),   // Unemployment rate
      fetchOne('WALCL'),    // Fed total assets
    ]);

    const rate = rateRaw ? `${rateRaw}%` : null;
    const jobs = jobsRaw ? `Unemployment: ${jobsRaw}%` : null;
    const assets =
      assetsRaw && !Number.isNaN(Number(assetsRaw))
        ? `$${(Number(assetsRaw) / 1_000_000).toFixed(2)}T`
        : null;

    return { rate, jobs, assets };
  }

  

  private async getPerplexityStats(): Promise<PerplexityStats> {
    const apiKey = this.configService.get<string>('PERPLEXITY_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'PERPLEXITY_API_KEY not configured, skipping Perplexity stats.',
      );
      return {
        ITEM1: null,
      ITEM2: null,
      ITEM3: null,
      ITEM4: null,
      ITEM5: null,
      ITEM6: null,
      ITEM7: null,
      ITEM8: null,
      ITEM9: null,
      ITEM10: null,
    };
  }

  const prompt = `
You are a macro market intelligence API. Your goal is to provide detailed, explanatory insights for each of the following 10 items.
For each item, search for the latest data (February 2026) and explain the context, recent trends, and current status.
Use qualitative phrases like "mid-3% range", "high-90s", "around X%", "mid-7T range", etc. if exact data is delayed.

For each item, provide a detailed paragraph (2-4 sentences).

Return the results strictly in this format:

ITEM1: <Detailed explanation of 2026 FOMC meeting dates including the 8-meeting structure and approximate schedule.>
ITEM2: <Detailed explanation of current US Interest Rate/Fed Funds target range upper bound.>
ITEM3: <Detailed explanation of latest US CPI Inflation YoY trends.>
ITEM4: <Detailed explanation of US Unemployment rate and current labour market status.>
ITEM5: <Detailed explanation of Gold spot price per ounce including recent price action.>
ITEM6: <Detailed explanation of DXY Dollar Index value and recent strength/weakness.>
ITEM7: <Detailed explanation of Bitcoin Dominance (BTC.D) and its significance in the current crypto market.>
ITEM8: <Detailed explanation of recent Spot Bitcoin ETF weekly flows (inflows/outflows).>
ITEM9: <Detailed explanation of current VIX Index (equity volatility) and Crypto Fear & Greed sentiment.>
ITEM10: <Detailed explanation of the Fed Balance Sheet (WALCL) assets and current QT/easing trends.>

Rules:
- Start each item exactly with "ITEMX: " on a new line.
- Provide a full paragraph of context and data for each.
- No markdown bolding inside the descriptions.
- No citations or reference links.
- No extra talk before or after the 10 items.
  `.trim();

    const res = await firstValueFrom(
      this.httpService.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
        },
        { headers: { Authorization: `Bearer ${apiKey}` } },
      ),
    );

    console.log('res data', res.data.choices[0].message.content);

    const text: string = res.data?.choices?.[0]?.message?.content ?? '';
    const stats: PerplexityStats = {
    ITEM1: null,
    ITEM2: null,
    ITEM3: null,
    ITEM4: null,
    ITEM5: null,
    ITEM6: null,
    ITEM7: null,
    ITEM8: null,
    ITEM9: null,
    ITEM10: null,
  };

    for (let i = 1; i <= 10; i++) {
      const nextItem = i < 10 ? `^ITEM${i + 1}:` : '$';
      // Match ITEM i: until the start of the next ITEM or end of string
      const regex = new RegExp(
        `^ITEM${i}:\\s*([\\s\\S]*?)(?=${nextItem})`,
        'im',
      );
      const match = text.match(regex);
      stats[`ITEM${i}` as keyof PerplexityStats] = match
        ? match[1].trim().replace(/\[.*?\]/g, '')
        : null;
    }

    return stats;
  }


  async getLatestData(): Promise<any> {
    const latest = await this.perplexityModel
      .findOne()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!latest) {
      return { message: 'No data found' };
    }

    if (typeof latest.response !== 'string') {
      return latest.response;
    }

    try {
      return JSON.parse(latest.response);
    } catch {
      return { response: latest.response };
    }
  }
}
