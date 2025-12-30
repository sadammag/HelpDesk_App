import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../user.entity';

// ВОЗВРАЩЕНИЕ ТОКЕНА И ПОЛЬЗОВАТЕЛЯ - тест

@ObjectType()
export class AuthResponse {
  @Field(() => User)
  user: User;

  @Field()
  token: string;
}
