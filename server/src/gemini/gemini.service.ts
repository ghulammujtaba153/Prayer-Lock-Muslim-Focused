import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GeminiStats } from './schemas/gemini.schemas';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(GeminiStats.name) private geminiStatsModel: Model<GeminiStats>,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      this.logger.error('GOOGLE_API_KEY is not defined');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async getDailyStats() {
    const date = new Date().toISOString().split('T')[0];

    const cached = await this.geminiStatsModel.findOne({ date });
    if (cached) return cached.stats;

    if (!this.genAI) throw new Error('Gemini AI not initialized');

    // Correct 2026 Tool Configuration for Google Search
    // Correct Tool Configuration for @google/generative-ai
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash', // Use 'gemini-3-flash-preview' if you have tier access
      tools: [
        {
          googleSearchRetrieval: {},
        },
      ],
    });

    const prompt = `
      Current Date: ${date}
      Use Google Search to retrieve the latest 2026 US market data.
      Return ONLY a JSON object. No units (%, USD), no sentences, no markdown backticks.

      Expected Schema:
      {
        "FOMC_Schedule": ["YYYY-MM-DD", "YYYY-MM-DD", ...],
        "Fed_Funds_Rate": 3.64,
        "CPI_Inflation_YoY": 2.7,
        "CPI_Inflation_MoM": 0.3,
        "Unemployment_Rate": 4.3,
        "Gold_Price_USD": 5088.0,
        "DXY_Index": 96.7,
        "BTC_Dominance": 56.2,
        "BTC_ETF_Weekly_Flow_USD": -1341000000,
        "VIX_Index": 17.4,
        "Fed_Balance_Sheet_Total": 6610000000000
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();

      // Safety: Strip markdown if the model hallucinates backticks
      text = text.replace(/```json|```/g, '').trim();

      const stats = JSON.parse(text);

      await this.geminiStatsModel.findOneAndUpdate(
        { date },
        { date, stats },
        { upsert: true, new: true },
      );

      return stats;
    } catch (error: any) {
      this.logger.error('Data Fetch Error', error.message);
      throw error;
    }
  }
}
