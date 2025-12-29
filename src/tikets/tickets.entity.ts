import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/useres/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';

export enum TicketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

// регистрирую enum для GraphQL
registerEnumType(TicketStatus, {
  name: 'TicketStatus',
});

@ObjectType() 
@Entity('tickets')
export class Ticket {
  @Field()
  @PrimaryGeneratedColumn('uuid', { name: '_id' })
  id: string;

  @Field()
  @Column({ name: 'title' })
  title: string;

  @Field()
  @Column({ name: 'description' })
  description: string;

  @Field(() => TicketStatus)
  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN, name: 'status' })
  status: TicketStatus;

  @Field()
  @CreateDateColumn({ name: 'created_date', type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'modified_date', type: 'timestamp' })
  updatedAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, user => user.tickets, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
