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
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dateStr = now.toDateString();

    try {
      // 1. Check if we have cached data for this month
      const cachedTrend = await this.trendModel.findOne({ monthKey });
      if (cachedTrend) {
        // Auto-refresh if the data contains old years (2024/2023)
        const dataStr = JSON.stringify(cachedTrend.data);
        const isStale = dataStr.includes('2024') || dataStr.includes('2023');

        if (!isStale) {
          console.log(
            `[TraderService] Returning cached trends for ${monthKey}`,
          );
          return cachedTrend.data as EconomicTrends;
        }
        console.log(
          `[TraderService] Stale data detected for ${monthKey}, re-fetching from Gemini...`,
        );
      }

      console.log(
        `[TraderService] Fetching new trends from Gemini for ${monthKey}`,
      );

      const prompt = `Today's date is ${dateStr}. Return a JSON object with the LATEST available US economic data as of this date. 
        Do not provide historical data from 2024 or earlier if there is no data available then u can return the data from 2024. Search for the most recent values for:
        1. Fed Funds Rate Target
        2. Next FOMC Meeting Date
        3. Rate Decision Probabilities (hike, hold, cut)
        4. Fed Balance Sheet (QE/QT)
        5. CPI (YoY, MoM)
        6. Core CPI (YoY)
        7. PCE Inflation (YoY)
        8. Next CPI Release Date
        9. DXY Index Value
        10. Unemployment Rate and Non-Farm Payrolls

        JSON Structure:
        {
          "fedFundsRate": "string",
          "nextFomcMeeting": "string",
          "rateDecisionProbability": { "hike": "string", "hold": "string", "cut": "string" },
          "fedBalanceSheet": "string",
          "inflation": {
            "cpi": { "yoy": "string", "mom": "string" },
            "coreCpi": "string",
            "pce": "string",
            "nextRelease": "string"
          },
          "dxyIndex": "string",
          "laborMarket": { "unemploymentRate": "string", "nonFarmPayrolls": "string" },
          "lastUpdated": "string (ISO)"
        }`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text: string = response.text();
      const parsedData = JSON.parse(text) as EconomicTrends;

      // 2. Save fetched data to DB
      await this.trendModel.findOneAndUpdate(
        { monthKey },
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
