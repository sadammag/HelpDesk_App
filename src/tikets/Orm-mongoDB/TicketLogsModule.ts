import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketLogsService } from './ticket-logs.service';
import { TicketLog, TicketLogSchema } from './ticket-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TicketLog.name, schema: TicketLogSchema },
    ]),
  ],
  providers: [TicketLogsService],
  exports: [TicketLogsService], // чтобы другие модули могли его использовать
})
export class TicketLogsModule {}
