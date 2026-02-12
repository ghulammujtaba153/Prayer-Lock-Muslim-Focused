import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GeminiStats extends Document {
  @Prop({ required: true, unique: true })
  date: string; // YYYY-MM-DD

  @Prop({ type: Object, required: true })
  stats: any;
}

export const GeminiStatsSchema = SchemaFactory.createForClass(GeminiStats);
