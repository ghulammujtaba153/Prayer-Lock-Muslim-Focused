import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ default: null })
  country: string;

  @Prop({ default: null })
  marketType: string;

  @Prop({ default: 'neutral', enum: ['bullish', 'neutral', 'bearish'] })
  sentiment: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: null })
  refreshToken: string;

  @Prop({ default: null })
  avatar?: string;

  @Prop({ default: 0 })
  streak: number;

  @Prop({ default: null })
  lastCompletedDate?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
