import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ticket } from "./tickets.entity";
import { TicketsService } from "./tickets.service";
import { TicketsResolver } from "./tickets.resolver";

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [TicketsService, TicketsResolver],
})
export class TicketsModule {}
