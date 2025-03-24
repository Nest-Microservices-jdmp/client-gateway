/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Request } from 'express';
import { catchError, firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = await context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const { user, token: newToken } = await firstValueFrom(
        this.client.send({ cmd: 'auth.verify.user' }, token).pipe(
          catchError((err) => {
            throw new RpcException(err);
          }),
        ),
      );

      request['user'] = user;

      request['token'] = newToken;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
