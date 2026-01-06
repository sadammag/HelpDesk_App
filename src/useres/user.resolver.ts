import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthResponse } from './dto/auth-user.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/jwt-auth.guards';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  // Регистриация
  @Mutation(() => AuthResponse)
  async register(
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.usersService.register(name, email, password);
  }

  // Логирование
  @Mutation(() => AuthResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.usersService.login(email, password);
  }

  // Проверка авторизации
  @Query(() => User)
  @UseGuards(GqlAuthGuard) // проверяем токен
  me(@CurrentUser() user: User) {
    return user; // возвращаем пользователя, если токен валиден
  }
}
