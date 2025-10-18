import { GlobalExceptionFilter, SocketIOAdapter } from '@kanban-board/shared';
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
      logger: {
        level: 'info', // production: 'info' or 'warn'
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined
      }
    })
  );

  const logger = new Logger('Bootstrap');
  app.useLogger(logger);
  app.useGlobalFilters(new GlobalExceptionFilter());
  const globalPrefix = 'api';

  const configService = app.get(ConfigService);

  const origins = configService
    .get<string>('CORS_ORIGINS')
    ?.split(',')
    .map((url) => url.trim());

  app.useWebSocketAdapter(new SocketIOAdapter(app, origins));

  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  });

  const port = process.env.PORT || 3004;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
