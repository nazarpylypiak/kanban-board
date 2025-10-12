import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  @RabbitSubscribe({
    exchange: 'kanban_exchange',
    routingKey: 'task.*',
    queue: 'notification_queue'
  })
  async handleTaskEvent(event: any, amqpMsg: any) {
    const eventType = amqpMsg.fields.routingKey;
    this.logger.log(`📬 Received event: ${eventType}`);
    await this.notificationService.handleEvent({ ...event, type: eventType });
  }
}
