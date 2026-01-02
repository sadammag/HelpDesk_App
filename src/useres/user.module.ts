import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UsersService } from "./users.service";
import { UsersResolver } from "./user.resolver";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
       JwtModule.register({
      secret: 'secret_key_safasf', // process.env.JWT_SECRET
      signOptions: { expiresIn: '1h' },
    }),
],
  providers: [UsersService, UsersResolver],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}
