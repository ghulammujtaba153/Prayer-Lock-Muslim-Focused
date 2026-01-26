import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class QuranSession extends Document {
  @Prop()
  day: number;

  @Prop({ type: String, ref: 'User' })
  userId: string;

  @Prop({ default: 1 })
  quranPage: number;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: Date.now() })
  updatedAt: Date;
}

export const QuranSessionSchema = SchemaFactory.createForClass(QuranSession);
