import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Narrative extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  marketType: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: ['neutral', 'bullish', 'bearish'], default: 'neutral' })
  sentiment: string;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD for daily caching
}

export const NarrativeSchema = SchemaFactory.createForClass(Narrative);
NarrativeSchema.index({ userId: 1, date: 1, sentiment: 1 }, { unique: true, name: 'narrative_cache_unique' });
