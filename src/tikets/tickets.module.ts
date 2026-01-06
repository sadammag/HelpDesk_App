import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsResolver } from './tickets.resolver';
import { UsersModule } from 'src/useres/user.module';
import { GqlAuthGuard } from 'src/auth/jwt-auth.guards';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket } from './tickets.entity';
import { TicketLogsService } from './Orm-mongoDB/ticket-logs.service';
import { TicketLogsModule } from './Orm-mongoDB/TicketLogsModule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    //MongooseModule.forFeature([{ name: TicketLog.name, schema: TicketLogSchema }]), // <-- подключаем коллекцию Mongo
    UsersModule,
    TicketLogsModule,
  ],
  providers: [TicketsService, TicketsResolver, GqlAuthGuard],
})
export class TicketsModule {}
