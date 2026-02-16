import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'finhub_quotes' })
export class FinhubQuote extends Document {
  @Prop({ required: true, index: true })
  symbol: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  change: number;

  @Prop({ required: true })
  percentChange: number;

  @Prop({ required: true })
  high: number;

  @Prop({ required: true })
  low: number;

  @Prop({ required: true })
  open: number;

  @Prop({ required: true })
  previousClose: number;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const FinhubQuoteSchema = SchemaFactory.createForClass(FinhubQuote);