import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class TicketLogGQL {
  @Field()
  ticketId: string;

  @Field()
  authorId: string;

  @Field()
  message: string;

  @Field()
  createdAt: Date;
}
