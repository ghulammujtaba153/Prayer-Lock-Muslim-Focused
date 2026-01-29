import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TraderController } from './trader.controller';
import { TraderService } from './trader.service';
import { Trend, TrendSchema } from './schemas/trends.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trend.name, schema: TrendSchema }]),
  ],
  controllers: [TraderController],
  providers: [TraderService],
})
export class TraderModule {}
