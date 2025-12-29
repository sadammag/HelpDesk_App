import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Mutation(() => User)
  async register(
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.usersService.register(name, email, password);
  }

  @Mutation(() => User, { nullable: true })
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.usersService.login(email, password);
  }

  @Query(() => [User])
  async users() {
    return this.usersService.findAll();
  }
}