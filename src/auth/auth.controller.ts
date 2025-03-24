import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { LoginUserDto, RegisterUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './interfaces';
import { Token, User } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.client
      .send({ cmd: 'auth.register.user' }, registerUserDto)
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.client.send({ cmd: 'auth.login.user' }, loginUserDto).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Get('verify')
  verifyUser(@User() user: CurrentUser, @Token() token: string) {
    return { user, token };
  }
}
