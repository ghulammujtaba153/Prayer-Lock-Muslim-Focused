import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { EconomicTrends } from './interfaces/trends.interface';

@Injectable()
export class TraderService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
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
    const prompt = `Return a JSON object with the latest US economic data:
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text: string = response.text();
      return JSON.parse(text) as EconomicTrends;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Gemini API Error:', errorMessage);
      throw new Error(`Economic Trends API failed: ${errorMessage}`);
    }
  }
}
