import { MailModule, RMQModule } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    NotificationModule,
    MailModule,
    RMQModule,
    EventsModule
  ]
})
export class AppModule {}
