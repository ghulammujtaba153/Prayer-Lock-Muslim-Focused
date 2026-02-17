import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CalendarEvent extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  start: string; // ISO format or date string

  @Prop()
  end?: string;

  @Prop()
  backgroundColor?: string;

  @Prop()
  borderColor?: string;

  @Prop()
  description?: string;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);
