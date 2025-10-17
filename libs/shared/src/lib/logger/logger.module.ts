import { Global, Module } from '@nestjs/common';
import { LoggerInterceptor } from './logger.interceptor';
import { LoggerService } from './logger.service';

@Global()
@Module({
  providers: [LoggerService, LoggerInterceptor],
  exports: [LoggerService, LoggerInterceptor]
})
export class LoggerModule {}
