import { MailModule } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { BoardListener } from './listeners/board.listener';
import { ColumnListener } from './listeners/column.listener';
import { TaskListener } from './listeners/task.listener';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
  imports: [MailModule],
  providers: [
    NotificationService,
    NotificationGateway,
    BoardListener,
    ColumnListener,
    TaskListener
  ]
})
export class NotificationModule {}
