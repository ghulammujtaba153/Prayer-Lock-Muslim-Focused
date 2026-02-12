import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { GeminiStats, GeminiStatsSchema } from './schemas/gemini.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GeminiStats.name, schema: GeminiStatsSchema },
    ]),
  ],
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
