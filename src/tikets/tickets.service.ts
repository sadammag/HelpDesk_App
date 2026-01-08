import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from 'src/useres/user.entity';
import { Ticket, TicketStatus } from './tickets.entity';
import { TicketLogsService } from './Orm-mongoDB/ticket-logs.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private ticketLogsService: TicketLogsService,
  ) {}

  // Создание билета
  async createTicket(
    title: string,
    description: string,
    status: TicketStatus,
    user: User,
    message?: string,
  ) {
    // Основные поля
    const ticket = this.ticketsRepository.create({
      title,
      description,
      status,
      user,
    });

    // Сохроняем билет в БД (Postgres)
    const savedTicket = await this.ticketsRepository.save(ticket);
    // Сохроняем логи в БД (MongoDB)
    await this.ticketLogsService.createLog(
      savedTicket.id,
      user.id,
      message || '',
    );

    // Получаем все логи
    const logs = await this.ticketLogsService.getLogsByTicket(savedTicket.id);

    return { ...savedTicket, logs }; // logs - массив объектов из MongoDB
  }

  // Обновления билета
  async updateTicket(
    user: User,
    id: string,
    title?: string,
    description?: string,
    status?: TicketStatus,
    message?: string,
  ) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!ticket) throw new NotFoundException('Билет не найден');
    if (ticket.user.id !== user.id) {
      throw new ForbiddenException(
        'Нет доступа к редактированию чужого билета',
      );
    }

    if (title !== undefined) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (status !== undefined) ticket.status = status;

    // Сохраняем изменения в PostgreSQL
    const updatedTicket = await this.ticketsRepository.save(ticket);
    // Если есть message, обновляем лог в MongoDB по ticketId
    if (message) {
      await this.ticketLogsService.updateLogByTicketId(ticket.id, message);
    }

    return updatedTicket;
  }

  // Получение всех билетов пользователя
  // async getTicketsByUser(userId: string) {
  //   return this.ticketsRepository.find({
  //     where: { user: { id: userId } },
  //     relations: ['user'],
  //     order: { createdAt: 'DESC' }, //  ASC сортировка по дате создания
  //   });
  // }

  async getTicketsByUser(userId: string, search?: string) {
    const where = {
      user: { id: userId },
      ...(search && search.trim() !== ''
        ? { title: ILike(`%${search.trim()}%`) }
        : {}),
    };

    return this.ticketsRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Удаление билета
  async removeTicket(id: string, user: User) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!ticket) {
      console.log('Билет не найден !!!');
      throw new NotFoundException('Билет не найден');
    }

    if (ticket.user.id !== user.id) {
      console.log('Нет доступа к другому билету');
      throw new ForbiddenException('Нет доступа к удалению чужого билета');
    }

    try {
      await this.ticketLogsService.deleteLogsByTicket(id);
      await this.ticketsRepository.delete(id);
      return true;
    } catch (e) {
      throw new InternalServerErrorException('Ошибка при удалении билета');
    }
  }
}
