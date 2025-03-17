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

@Catch(Error) // Captura cualquier tipo de error
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof RpcException) {
      const rpcError = exception.getError() as RpcError | string;

      if (this.isRpcError(rpcError)) {
        const status = rpcError.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json(rpcError);
        return;
      }

      response.status(HttpStatus.BAD_REQUEST).json(rpcError);
      return;
    }

    if (
      exception.message.includes('No subscribers') ||
      exception.message.includes('Connection refused') ||
      exception.message.includes('timeout')
    ) {
      console.error(`🔴 Microservice unavailable: ${exception.message}`);
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Service is currently unavailable. Please try again later.',
      });
      return;
    }

    console.error(`Unhandled error: ${exception.message}`);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'There are no subscribers listening to that message',
    });
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
