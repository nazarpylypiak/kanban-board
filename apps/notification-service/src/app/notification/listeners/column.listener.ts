import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  IColumnNotificationWrapper,
  INotification
} from '@kanban-board/shared';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification.service';

@Injectable()
export class ColumnListener {
  private readonly logger = new Logger(ColumnListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  @RabbitSubscribe({
    exchange: 'kanban_exchange',
    routingKey: 'column.*',
    queue: 'notification_queue'
  })
  async handleColumnEvent(payload: INotification<IColumnNotificationWrapper>) {
    this.logger.log(`📬 Received board event: ${payload.eventType}`);
    this.notificationService.handleEvent(payload);
  }
}
