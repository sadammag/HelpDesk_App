import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { User } from './useres/user.entity';
import { UsersModule } from './useres/user.module';
import { TicketsModule } from './tikets/tickets.module';
import { Ticket } from './tikets/tickets.entity';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule } from "@nestjs/config";


@Module({
  imports: [
    ConfigModule.forRoot({          // - чтобы нест считывал всю конфигурацию
         envFilePath: `.development.env`   // путь до файла конфигурации
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESS_HOST,
      port: Number(process.env.POSTGRESS_PORT),
      username: process.env.POSTGRESS_USER,
      password: process.env.POSTGRESS_PASSWORD,
      database: process.env.POSTGRESS_DB,
      entities: [User, Ticket],
      synchronize: true,        // Автоматически создание таблица     
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver, 
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),
    UsersModule,
    TicketsModule,
  ],
})
export class AppModule {}

