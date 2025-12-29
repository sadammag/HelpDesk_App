import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TicketsService } from './tickets.service';
import { Ticket, TicketStatus } from './tickets.entity';
import { User } from 'src/useres/user.entity';

@Resolver(() => Ticket)
export class TicketsResolver {
  constructor(private ticketsService: TicketsService) {}

  @Mutation(() => Ticket)
  createTicket(
    @Args('title') title: string,
    @Args('description') description: string,
    @Args('userId') userId: string,
  ) {
    const user = new User();
    user.id = userId; //
    return this.ticketsService.createTicket(title, description, user);
  }

  @Mutation(() => Ticket, { nullable: true })
  editTicket(
    @Args('id') id: string,
    @Args('title', { nullable: true }) title?: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('status', { nullable: true }) status?: TicketStatus,
  ) {
    return this.ticketsService.updateTicket(id, title, description, status);
  }

  @Mutation(() => Boolean)
  removeTicket(@Args('id') id: string) {
    return this.ticketsService.removeTicket(id).then(() => true).catch(() => false);
  }


  @Query(() => [Ticket])
  ticketsByUser(
  @Args('userId') userId: string,
  ) {
  return this.ticketsService.getTicketsByUser(userId);
  }

}
