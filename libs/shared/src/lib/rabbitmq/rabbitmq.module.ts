import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'kanban_exchange',
            type: 'topic'
          }
        ],
        uri:
          configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
        connectionInitOptions: { wait: true }
      }),
      inject: [ConfigService]
    })
  ],
  exports: [RabbitMQModule]
})
export class RMQModule {}
