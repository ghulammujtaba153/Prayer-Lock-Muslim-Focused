import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Perplexity extends Document {
  @Prop({ required: true })
  query: string;

  @Prop({ required: true })
  response: string;
}

export const PerplexitySchema = SchemaFactory.createForClass(Perplexity);