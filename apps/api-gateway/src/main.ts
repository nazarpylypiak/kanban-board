import fastifyProxy from '@fastify/http-proxy';
import { GlobalExceptionFilter, LoggerService } from '@kanban-board/shared';
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
  app.setGlobalPrefix(globalPrefix);

  const configService = app.get(ConfigService);

  const origins = configService
    .get<string>('CORS_ORIGINS')
    ?.split(',')
    .map((url) => url.trim());

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  });

  const services = [
    { prefix: '/auth', target: 'http://localhost:3001' },
    { prefix: '/users', target: 'http://localhost:3002' },
    { prefix: '/boards', target: 'http://localhost:3003' },
    { prefix: '/columns', target: 'http://localhost:3003' },
    { prefix: '/tasks', target: 'http://localhost:3003' },
    { prefix: '/notify', target: 'http://localhost:3004' },
    { prefix: '/analytics', target: 'http://localhost:3005' }
  ];

  for (const { prefix, target } of services) {
    await app.register(fastifyProxy, {
      upstream: target,
      prefix: `/${globalPrefix}${prefix}`,
      rewritePrefix: `/${globalPrefix}${prefix}`,
      http2: false
    });
    logger.log(`🔗 ${prefix} → ${target}`);
  }

  const port = process.env.PORT || 4400;
  await app.listen(port);
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
