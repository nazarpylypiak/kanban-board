import {
  GlobalExceptionFilter,
  LoggerService,
  SocketIOAdapter
} from '@kanban-board/shared';
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
    }),
    { logger: false }
  );

  const loggerService = app.get(LoggerService);
  const logger = loggerService.child({ context: 'Bootstrap' });
  app.useLogger(logger);
  app.useGlobalFilters(new GlobalExceptionFilter());
  const globalPrefix = 'api';

  const configService = app.get(ConfigService);

  const origins = configService
    .get<string>('CORS_ORIGINS')
    ?.split(',')
    .map((url) => url.trim());

  app.useWebSocketAdapter(new SocketIOAdapter(app, origins, loggerService));

  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  });

  const port = process.env.PORT || 3004;
  await app.listen(port);
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
