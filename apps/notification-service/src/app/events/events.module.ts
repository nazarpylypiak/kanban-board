import { MailModule, RMQModule } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationListener } from '../notification/notification.listener';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [RMQModule, MailModule],
  providers: [NotificationService, NotificationListener, NotificationGateway]
})
export class EventsModule {}
