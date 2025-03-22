import { Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { NATS_SERVICE } from 'src/config';

@Controller('auth')
export class AuthController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  registerUser() {
    return this.client.send({ cmd: 'auth.register.user' }, { abc: 'a' }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @Post('login')
  findProducts() {
    return this.client.send({ cmd: 'auth.login.user' }, { abc: 'a' });
  }

  @Get('verify')
  findOneProductById() {
    return this.client.send({ cmd: 'auth.verify.user' }, { abc: 'a' }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }
}
