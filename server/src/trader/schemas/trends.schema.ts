import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Trend extends Document {
  @Prop({ required: true, unique: true })
  monthKey: string; // Format: "YYYY-MM"

  @Prop({ type: Object, required: true })
  data: any; // Stores the EconomicTrends object
}

export const TrendSchema = SchemaFactory.createForClass(Trend);
