import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Ticket } from 'src/tikets/tickets.entity';

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid') // UUID вместо числа (большой уникальный идентификатор)
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field(() => [Ticket])
  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];
}
