import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { TraderController } from './trader.controller';
import { TraderService } from './trader.service';
import { Trend, TrendSchema } from './schemas/trends.schema';
import { FinhubQuote, FinhubQuoteSchema } from './schemas/finhub.Schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Trend.name, schema: TrendSchema },
      { name: FinhubQuote.name, schema: FinhubQuoteSchema },
    ]),
    HttpModule,
  ],
  controllers: [TraderController],
  providers: [TraderService],
  exports: [TraderService],
})
export class TraderModule {}
