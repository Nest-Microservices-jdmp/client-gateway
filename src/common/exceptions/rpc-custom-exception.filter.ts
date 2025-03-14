import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

interface RpcError {
  status: number;
  message: string;
  error?: string;
}

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const rpcError = exception.getError() as RpcError | string;

    if (this.isRpcError(rpcError)) {
      const status = rpcError.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      response.status(status).json(rpcError);
    }

    response.status(HttpStatus.BAD_REQUEST).json(rpcError);
  }

  private isRpcError(error: unknown): error is RpcError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      'message' in error &&
      typeof (error as RpcError).status === 'number' &&
      typeof (error as RpcError).message === 'string'
    );
  }
}
