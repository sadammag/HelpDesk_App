import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthResponse } from './dto/auth-user.dto';

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


}