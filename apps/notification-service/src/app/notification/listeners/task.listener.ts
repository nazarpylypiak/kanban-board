import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { INotification, ITaskNotificationWrapper } from '@kanban-board/shared';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification.service';

@Injectable()
export class TaskListener {
  private readonly logger = new Logger(TaskListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  @RabbitSubscribe({
    exchange: 'kanban_exchange',
    routingKey: 'task.*',
    queue: 'notification_queue'
  })
  async handleTaskEvent(payload: INotification<ITaskNotificationWrapper>) {
    this.logger.log(`📬 Received board event: ${payload.eventType}`);
    this.notificationService.handleEvent(payload);
  }
}
