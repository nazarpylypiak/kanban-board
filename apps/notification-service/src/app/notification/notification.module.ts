import { MailModule } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { BoardListener } from './listeners/board.listener';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
  imports: [MailModule],
  providers: [NotificationService, NotificationGateway, BoardListener]
})
export class NotificationModule {}
