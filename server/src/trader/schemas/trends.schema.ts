import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Trend extends Document {
  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ required: true, index: true })
  monthKey: string; // Format: "YYYY-MM" (keep for easy grouping/lookup)

  @Prop({ type: Object, required: true })
  data: any; // Stores the EconomicTrends object

  @Prop({ type: Object })
  metadata: { source: string; environment: string };
}

export const TrendSchema = SchemaFactory.createForClass(Trend);
