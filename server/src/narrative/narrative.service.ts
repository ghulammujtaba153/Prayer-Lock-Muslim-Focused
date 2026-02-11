import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Narrative } from './schemas/narrative.schema';
import { User } from '../auth/schemas/user.schema';
import { PerplexityService } from '../perplexity/perplexity.service';
import { TraderService } from '../trader/trader.service';

@Injectable()
export class NarrativeService implements OnModuleInit {
  private readonly logger = new Logger(NarrativeService.name);

  constructor(
    @InjectModel(Narrative.name) private narrativeModel: Model<Narrative>,
    @InjectModel(User.name) private userModel: Model<User>,
    private perplexityService: PerplexityService,
    private traderService: TraderService,
  ) {}

  async onModuleInit() {
    try {
      // Clean up old unique index that didn't include sentiment
      // This is a one-time fix for existing databases
      await this.narrativeModel.collection.dropIndex('userId_1_date_1');
      this.logger.log('Successfully dropped stale index: userId_1_date_1');
    } catch {
      // If index doesn't exist, it will throw, we can ignore
      this.logger.debug('Index userId_1_date_1 not found or already dropped');
    }
  }

  async getPersonalizedNarrative(userId: string) {
    // 1. Get User Info First (ALWAYS)
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    const country = user.country || 'Global';
    const marketType = user.marketType || 'General Markets';
    const sentiment = (user.sentiment || 'neutral').toLowerCase();

    const today = new Date().toISOString().split('T')[0];

    // 2. Check Cache
    const cached = await this.narrativeModel.findOne({
      userId,
      date: today,
      sentiment,
    });
    if (cached) {
      this.logger.log(
        `Returning cached narrative for user ${userId} with sentiment ${sentiment}`,
      );
      return cached;
    }

    this.logger.log(
      `Generating new narrative for ${country} / ${marketType} with sentiment ${sentiment}`,
    );

    // 3. Get latest market stats
    let marketStats = {};
    try {
      marketStats = await this.perplexityService.getLatestData();
    } catch (err) {
      this.logger.error(
        'Failed to fetch latest market stats',
        (err as Error).message,
      );
    }

    // 4. Generate Narrative via Perplexity
    const narrativeContent = await this.generateNarrativeContent(
      country,
      marketType,
      sentiment,
      marketStats,
    );

    // 5. Save and Return (Using findOneAndUpdate for robust upsert/caching)
    const updatedNarrative = await this.narrativeModel.findOneAndUpdate(
      { userId, date: today, sentiment }, // Match criteria
      {
        userId,
        country,
        marketType,
        sentiment,
        content: narrativeContent,
        date: today,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return updatedNarrative;
  }

  private async generateNarrativeContent(
    country: string,
    marketType: string,
    sentiment: string,
    stats: any,
  ): Promise<string> {
    const statsContext = stats && Object.keys(stats).length > 0
      ? `LATEST MARKET STATS:\n${JSON.stringify(stats, null, 2)}`
      : 'LATEST MARKET STATS: (Use general February 2026 data as fallback)';

    const prompt = `
You are a master financial storyteller and macro analyst.
Generate a compelling, easy-to-consume narrative about the current economic environment for someone living in ${country} whose primary financial interest is ${marketType}.

${statsContext}

Current Market Sentiment provided by user: ${sentiment.toUpperCase()}

Your task:
1. Write a cohesive "story" of what is happening in the world of finance right now from the perspective of someone in ${country}.
2. Tone of the story should be influenced by the sentiment: ${sentiment.toUpperCase()}. If Bullish, focus on growth/opportunity. If Bearish, focus on risk/preservation. If Neutral, stay balanced.
3. Incorporate the latest market stats provided above (FOMC, Interest Rates, CPI, Jobs, Gold, Bitcoin etc.) into the narrative naturally.
4. Focus on how global macro trends impact ${marketType} specifically for someone in ${country}.
5. Explain complex concepts into simple, relatable narrative beats.
6. Keep the tone professional yet highly engaging - like a top-tier financial newsletter.
7. Do NOT use bullet points or markdown tables. Use paragraphs only.
8. Target length: 300-400 words.

Finish with a brief "The Bottom Line" summary paragraph.
`;

    // Use Perplexity to generate the narrative
    return await this.perplexityService.generateGenericResponse(prompt);
  }
}
