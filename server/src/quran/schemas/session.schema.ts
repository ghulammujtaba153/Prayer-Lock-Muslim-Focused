import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class QuranSession extends Document {
  @Prop({ type: String, ref: 'User', required: true })
  user: string;

  @Prop({ default: 0 })
  day: number;

  @Prop({ default: 1 })
  page: number;

  @Prop({ default: 0 })
  streak: number;
}

export const QuranSessionSchema = SchemaFactory.createForClass(QuranSession);
