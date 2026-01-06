import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {} // только JwtService

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const authHeader = req.headers.authorization;
    if (!authHeader)
      throw new UnauthorizedException('Пользователь не авторизован');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new UnauthorizedException('Пользователь не авторизован');

    try {
      const payload = this.jwtService.verify(token); // проверяем токен
      req.user = payload; // теперь @CurrentUser() будет возвращать id и email
      return true;
    } catch (err) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }
  }
}
