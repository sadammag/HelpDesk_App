import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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


  // Создание билета
  async createTicket(title: string, description: string, status:TicketStatus, user: User ) {
    const ticket = this.ticketsRepository.create({ title, description, status , user });
    return this.ticketsRepository.save(ticket);
  }


  // Обновления билета
  async updateTicket(
    user: User,
    id: string,
    title?: string,
    description?: string,
    status?: TicketStatus,
  ) {

    const ticket = await this.ticketsRepository.findOne({ where: { id }, relations: ['user'] });
    if (!ticket) throw new NotFoundException('Билет не найден');
    if (ticket.user.id !== user.id) {
      throw new ForbiddenException('Нет доступа к редактированию чужого билета');
    }

    if (title !== undefined) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (status !== undefined) ticket.status = status;

    return this.ticketsRepository.save(ticket);
  }


  // Получение всех билетов
  async getTicketsByUser(userId: string) {
    return this.ticketsRepository.find({
      where: { user: { id: userId } }, // Условие нахождения вcех билтов пользователя
      relations: ['user'],
      order: { createdAt: 'DESC' } //  ASC сортировка по дате создания
    });
  }


  // Удаление билета
  async removeTicket(id: string, user: User) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!ticket)  {
      console.log('Билет не найден !!!')
      throw new NotFoundException('Билет не найден');
    }

    if (ticket.user.id !== user.id) {
      console.log('Нет доступа к другому билету')
      throw new ForbiddenException('Нет доступа к удалению чужого билета');
    }

    await this.ticketsRepository.delete(id);
    return true;
}



  // // Получения 1 конкретного билета
  // async getTicketById(id: string) {
  // return this.ticketsRepository.findOne({
  //   where: { id },
  //   relations: ['user'], 
  // });
  // }
}
