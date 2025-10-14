import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ITaskEventPayload, TTaskEventType } from '@kanban-board/shared';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';

interface AmqpRawMessage {
  content: Buffer;
  fields: {
    routingKey: string;
    deliveryTag: number;
    exchange: string;
    redelivered: boolean;
  };
  properties: Record<string, any>;
}
@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  @RabbitSubscribe({
    exchange: 'kanban_exchange',
    routingKey: 'task.*',
    queue: 'notification_queue'
  })
  async handleTaskEvent(payload: ITaskEventPayload, amqpMsg: AmqpRawMessage) {
    const eventType = amqpMsg.fields.routingKey as TTaskEventType;
    this.logger.log(`📬 Received event: ${eventType}`);

    await this.notificationService.handleTaskEvent({ payload, eventType });
  }

  // @RabbitSubscribe({
  //   exchange: 'kanban_exchange',
  //   routingKey: 'board.*',
  //   queue: 'notification_queue'
  // })
  // async handleBoardEvent(event: any, amqpMsg: any) {
  //   const eventType = amqpMsg.fields.routingKey;
  //   this.logger.log(`📬 Received event: ${eventType}`);
  // await this.notificationService.handleEvent({ payload: event, eventType });
  // }
}
