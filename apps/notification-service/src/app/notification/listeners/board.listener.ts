import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { IBoardNotification } from '@kanban-board/shared';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification.service';

@Injectable()
export class BoardListener {
  private readonly logger = new Logger(BoardListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  @RabbitSubscribe({
    exchange: 'kanban_exchange',
    routingKey: 'board.*',
    queue: 'notification_queue'
  })
  async handleBoardEvent(payload: IBoardNotification) {
    this.logger.log(`📬 Received board event: ${payload.eventType}`);
    this.notificationService.handleEvent(payload);
  }
}
