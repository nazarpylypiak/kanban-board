import { MailModule, RMQModule } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [RMQModule, MailModule],
  providers: [NotificationService, NotificationGateway]
})
export class EventsModule {}
