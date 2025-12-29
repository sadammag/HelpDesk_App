import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './tickets.entity';
import { User } from 'src/useres/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async createTicket(title: string, description: string, user: User) {
    const ticket = this.ticketsRepository.create({ title, description, user });
    await this.ticketsRepository.save(ticket);

      return this.ticketsRepository.findOne({  // Загружаем тикет заново вместе с пользователем
        where: { id: ticket.id },
        relations: ['user'],  // здесь указываем, что нужно загрузить user
      });
  }


  async updateTicket(id: string, title?: string, description?: string, status?: TicketStatus) {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) return null;
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (status) ticket.status = status;
    return this.ticketsRepository.save(ticket);
  }


  async removeTicket(id: string) {
    return this.ticketsRepository.delete(id);
  }


  async getTicketsByUser(userId: string) {
    return this.ticketsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }


}
