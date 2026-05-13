import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PUBLIC_ROUTE_KEY } from '../decorators/public.decorator';
import { AppJwtService } from '../app-jwt.service';
import { RequestWithUser } from '../types/request-with-user.type';

@Injectable()
export class AppJwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly appJwt: AppJwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
      throw new UnauthorizedException('Bearer token gerekli.');
    }

    request.user = await this.appJwt.verify(token);
    return true;
  }
}
