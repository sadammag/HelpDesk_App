import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from 'src/useres/user.entity';
import { Ticket, TicketStatus } from './tickets.entity';
import { TicketLogsService } from './Orm-mongoDB/ticket-logs.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private ticketLogsService: TicketLogsService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
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

    await this.invalidateUserTicketsCache(user.id);
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

    await this.invalidateUserTicketsCache(user.id);

    return updatedTicket;
  }

  // Получение всех билетов пользователя
  async getTicketsByUser(userId: string, search?: string) {
    // Создаём уникальный ключ для кэша
    const cacheKey = `tickets:${userId}:${search ?? 'all'}`;

    // Сначала пробуем получить данные из кэша
    const cached = await this.cacheManager.get<any[]>(cacheKey);

    console.log(cached);
    if (cached) {
      const normalized = cached.map((ticket) => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        logs: ticket.logs?.map((log) => ({
          ...log,
          createdAt: log.createdAt ? new Date(log.createdAt) : undefined,
        })),
      }));

      console.log(' Возвращаем данные из кеша с Date:', normalized);
      return normalized;
    }

    // Если нет в кэше — берём из базы
    const where = {
      user: { id: userId },
      ...(search && search.trim() !== ''
        ? { title: ILike(`%${search.trim()}%`) }
        : {}),
    };

    const tickets = await this.ticketsRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    // Сохраняем результат в кэш на 30 секунд
    await this.cacheManager.set(cacheKey, tickets, 300000);

    return tickets;
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
      await this.invalidateUserTicketsCache(user.id);
      return true;
    } catch (e) {
      throw new InternalServerErrorException('Ошибка при удалении билета');
    }
  }

  // Обновление кеша в Redis
  private async invalidateUserTicketsCache(userId: string) {
    // Получаем все ключи пользователя
    const keys: string[] = await this.cacheManager.store.keys(
      `tickets:${userId}:*`,
    );

    if (keys.length > 0) {
      await Promise.all(keys.map((key) => this.cacheManager.del(key)));
      //console.log(`Инвалидация кеша ${userId}:`, keys);
    }
  }
}
