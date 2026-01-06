import { Query, Resolver } from '@nestjs/graphql';

@Resolver() // Обработчик GraphQL запросов
export class AppResolver {
  @Query(() => String) // Метод "hello" будет GraphQL query, и он возвращает тип String.
  hello() {
    return 'GraphQL is working!';
  }
}

// NestJS генерирует GraphQL схему из этого класса:

// type Query {
//   hello: String
// }

// Эта схема потом видна в Playground и используется сервером
