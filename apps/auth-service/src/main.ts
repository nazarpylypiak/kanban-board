/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import cookie, { FastifyCookieOptions } from '@fastify/cookie';
import { GlobalExceptionFilter, LoggerService } from '@kanban-board/shared';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false
    })
  );

  const loggerService = app.get(LoggerService);
  const logger = loggerService.child({ context: 'Bootstrap' });
  app.useLogger(logger);
  app.useGlobalFilters(new GlobalExceptionFilter());
  const globalPrefix = 'api';

  const configService = app.get(ConfigService);
  const origins = configService
    .get<string>('CORS_ORIGIN')
    ?.split(',')
    .map((url) => url.trim());

  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  });
  await app.register(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cookie as any,
    {
      secret: configService.get<string>('COOKIE_SECRET')
    } as FastifyCookieOptions
  );

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
