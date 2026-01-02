import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ticket } from "./tickets.entity";
import { TicketsService } from "./tickets.service";
import { TicketsResolver } from "./tickets.resolver";
import { UsersModule } from "src/useres/user.module";
import { GqlAuthGuard } from "src/auth/jwt-auth.guards";

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]),UsersModule],
  providers: [TicketsService, TicketsResolver, GqlAuthGuard],
})
export class TicketsModule {}
