import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';
import { IRabbitMessage } from '../interfaces';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private channelModel: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url =
      this.config.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    try {
      this.channelModel = await connect(url);
      this.channel = await this.channelModel.createChannel();
      this.logger.log(`✅ Connected to RabbitMQ at ${url}`);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error('❌ Failed to connect to RabbitMQ', err.stack);
      }
    }
  }

  async publish<T extends string>(
    exchange: string,
    routingKey: T,
    message: IRabbitMessage
  ) {
    if (!this.channel) {
      this.logger.error('Channel not initialized, message not sent.');
      return;
    }

    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      const buffer = Buffer.from(JSON.stringify(message));
      this.channel.publish(exchange, routingKey, buffer);
      this.logger.log(`📤 Sent message to ${exchange}:${routingKey}`);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error('❌ Failed to publish message', err.stack);
      }
    }
  }

  async consume(
    queue: string,
    exchange: string,
    routingKey: string,
    handler: (data: any) => Promise<void>
  ) {
    if (!this.channel) {
      this.logger.error('Channel not initialized, cannot consume messages.');
      return;
    }

    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      const q = await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(q.queue, exchange, routingKey);

      this.channel.consume(q.queue, async (msg) => {
        if (!msg) return;
        try {
          const data = JSON.parse(msg.content.toString());
          await handler(data);
          this.channel!.ack(msg);
        } catch (err) {
          if (err instanceof Error) {
            this.logger.error(
              `❌ Error processing message: ${err.message}`,
              err.stack
            );
          }
          this.channel!.nack(msg, false, false);
        }
      });

      this.logger.log(`👂 Listening on ${exchange}:${routingKey}`);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error('❌ Failed to setup consumer', err.stack);
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.channelModel?.close();
      this.logger.log('🔌 RabbitMQ connection closed');
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error('❌ Error closing RabbitMQ connection', err.stack);
      }
    }
  }
}
