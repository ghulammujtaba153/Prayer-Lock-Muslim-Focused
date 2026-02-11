import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { PerplexityController } from './perplexity.controller';
import { PerplexityService } from './perplexity.service';
import { Perplexity, PerplexitySchema } from './schemas/perplexity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Perplexity.name, schema: PerplexitySchema }]),
    HttpModule,
  ],
  controllers: [PerplexityController],
  providers: [PerplexityService],
})
export class PerplexityModule {}
