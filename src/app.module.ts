import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { User } from './useres/user.entity';
import { UsersModule } from './useres/user.module';
import { TicketsModule } from './tikets/tickets.module';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { Ticket } from './tikets/tickets.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisConfig } from 'configRedis';
import { ScheduleModule } from '@nestjs/schedule';
import { SqsModule } from './sqs/sqs.module';
import { CacheCleanerService } from './sqs/cache-cleaner.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.development.env`,
    }),
    CacheModule.registerAsync(RedisConfig),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESS_HOST,
      port: Number(process.env.POSTGRESS_PORT),
      username: process.env.POSTGRESS_USER,
      password: process.env.POSTGRESS_PASSWORD,
      database: process.env.POSTGRESS_DB,
      entities: [User, Ticket],
      autoLoadEntities: true,
      synchronize: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),
    ScheduleModule.forRoot(), // 🔹 Для работы @Cron
    SqsModule,
    UsersModule,
    TicketsModule,
  ],
  providers: [
    CacheCleanerService, // 🔹 вот сюда
  ],
})
export class AppModule {}
