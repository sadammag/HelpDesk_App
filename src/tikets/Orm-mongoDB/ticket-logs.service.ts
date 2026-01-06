import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TicketLog, TicketLogDocument } from './ticket-log.schema';
//import { TicketLog, TicketLogDocument } from './schemas/ticket-log.schema';

@Injectable()
export class TicketLogsService {
  constructor(
    @InjectModel(TicketLog.name)
    private ticketLogModel: Model<TicketLogDocument>,
  ) {}

  // Создать новый лог
  async createLog(ticketId: string, authorId: string, message: string) {
    const log = new this.ticketLogModel({ ticketId, authorId, message });
    return log.save();
  }

  // Получить все логи по ticketId
  async getLogsByTicket(ticketId: string) {
    return this.ticketLogModel
      .find({ ticketId })
      .sort({ createdAt: 1 }) // сортировка по времени создания
      .exec();
  }
}
