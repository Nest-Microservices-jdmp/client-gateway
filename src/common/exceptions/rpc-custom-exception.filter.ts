import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

interface RpcError {
  status: number;
  message: string;
  error?: string;
}

@Catch(Error)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcCustomExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(`Error caught: ${exception.message}`, exception.stack);

    // Handling UnauthorizedException
    if (exception instanceof UnauthorizedException) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: exception.message || 'Unauthorized',
      });
      return;
    }

    // Handling NATS Transport Errors
    if (exception.message.includes('Empty response')) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Service is currently unavailable. Please try again later.',
      });
      return;
    }

    // Handling validation errors(BadRequestException)
    if (exception instanceof BadRequestException) {
      const errorResponse = exception.getResponse();
      response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      return;
    }

    if (exception instanceof RpcException) {
      const rpcError = exception.getError() as RpcError | string;

      if (typeof rpcError === 'string') {
        if (rpcError.includes('Empty response')) {
          response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message:
              'Service is currently unavailable. Please try again later.',
          });
          return;
        }
        response.status(HttpStatus.BAD_REQUEST).json({ message: rpcError });
        return;
      }

      if (this.isRpcError(rpcError)) {
        const status = rpcError.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json(rpcError);
        return;
      }
    }

    // Handling unhandled errors
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  // Check if the error is of type RpcError
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
