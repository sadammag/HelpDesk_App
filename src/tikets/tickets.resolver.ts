import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { TicketsService } from './tickets.service';
import { User } from 'src/useres/user.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/jwt-auth.guards';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Ticket, TicketStatus } from './tickets.entity';
import { TicketLogGQL } from './Orm-mongoDB/TicketLogGQL';
import { TicketLogsService } from './Orm-mongoDB/ticket-logs.service';

@Resolver(() => Ticket)
export class TicketsResolver {
  constructor(
    private ticketsService: TicketsService,
    private ticketLogsService: TicketLogsService,
  ) {}

  // Создание билета
  @Mutation(() => Ticket)
  @UseGuards(GqlAuthGuard)
  createTicket(
    @Args('title') title: string,
    @Args('description') description: string,
    @Args('status') status: TicketStatus,
    @CurrentUser()
    user: User,
    @Args('message') message: string,
  ) {
    let ticetResolver = this.ticketsService.createTicket(
      title,
      description,
      status,
      user,
      message,
    );

    return ticetResolver; //this.ticketsService.createTicket(title, description, status, user);
  }

  // Редактирование существующего билета
  @Mutation(() => Ticket, { nullable: true })
  @UseGuards(GqlAuthGuard)
  editTicket(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @Args('title', { nullable: true }) title?: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('status', { nullable: true }) status?: TicketStatus,
  ) {
    return this.ticketsService.updateTicket(
      user,
      id,
      title,
      description,
      status,
    );
  }

  // Получение всех билетов текущего пользователя
  @Query(() => [Ticket])
  @UseGuards(GqlAuthGuard)
  ticketsByUser(@CurrentUser() user: User) {
    return this.ticketsService.getTicketsByUser(user.id);
  }

  // GraphQL сам вызовет это ТОЛЬКО если запрошено поле logs
  @ResolveField(() => [TicketLogGQL])
  async logs(@Parent() ticket: Ticket) {
    return this.ticketLogsService.getLogsByTicket(ticket.id);
  }

  // Удаление кокретного билета
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeTicket(
    @Args('id') id: string,
    @CurrentUser() user: User, // Получаем пользователя из токена
  ) {
    return this.ticketsService
      .removeTicket(id, user)
      .then(() => true)
      .catch(() => false);
  }
}

// Получение 1 конкретного билета
//  @Query(() => Ticket, { nullable: true })
//  getTicketById(
//  @Args('id') id: string,
//  ){
//  return this.ticketsService.getTicketById(id);
//  }
