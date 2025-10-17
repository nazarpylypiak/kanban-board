import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = uuidv4();
    request.requestId = requestId;

    const userId = request.user?.sub;

    const meta = { requestId, userId };

    const childLogger = this.logger.child(meta);
    request.logger = childLogger;

    return next.handle().pipe(
      tap(() => {
        childLogger.info('HTTP Request completed', {
          method: request.method,
          path: request.url
        });
      })
    );
  }
}
