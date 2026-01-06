import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// Удобное получения текущего пользователя через кастомный декоратор
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context); // превращаем обычний контекст в GraphQL специфичный
    const req = ctx.getContext().req; // ! достаём HTTP-подобный объект запроса, чтобы получить заголовки и пользователя

    return req.user; // req.user должен быть полноценным User с name, email
  },
);

// ctx.getContext(); // Получает "context" GraphQL, который мы передавали в ApolloServer
// ctx.getArgs();    // Получает аргументы GraphQL запроса
// ctx.getRoot();    // Корневой объект resolver
