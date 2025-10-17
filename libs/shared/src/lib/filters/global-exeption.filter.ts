import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctxType = host.getType();

    if (ctxType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      let errorName = 'Error';
      let stack: string | undefined;

      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const res = exception.getResponse();
        if (typeof res === 'string') {
          message = res;
        } else if (typeof res === 'object' && res !== null) {
          const obj = res as Record<string, any>;
          message = obj['message'] || message;
          errorName = obj['error'] || exception.name;
        }
        stack = exception.stack;
      } else if (exception instanceof Error) {
        message = exception.message;
        errorName = exception.name;
        stack = exception.stack;
      }

      this.logger.error(
        `[${errorName}] ${message} - ${request.method} ${request.url}`,
        stack
      );

      if (
        typeof response?.status === 'function' &&
        typeof response?.json === 'function'
      ) {
        response.status(status).json({
          statusCode: status,
          error: errorName,
          message,
          path: request.url,
          timestamp: new Date().toISOString()
        });
      } else {
        this.logger.error(
          'Response object missing status/json methods',
          exception
        );
      }
    } else {
      this.logger.error(
        '[GlobalExceptionFilter] Non-HTTP exception',
        exception
      );
    }
  }
}
