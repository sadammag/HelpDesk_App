import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TicketLogDocument = TicketLog & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class TicketLog {
  @Prop({ required: true })
  ticketId: string;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: false, default: '' })
  message: string;
}

// В SchemaFactory createForClass — createdAt создаётся автоматически
export const TicketLogSchema = SchemaFactory.createForClass(TicketLog);
