import { MailModule } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { BoardListener } from './listeners/board.listener';
import { ColumnListener } from './listeners/column.listener';
import { TaskListener } from './listeners/task.listener';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtSignOptions =>
        ({
          secret: config.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
          }
        }) as JwtSignOptions
    }),
    MailModule
  ],
  providers: [
    NotificationService,
    NotificationGateway,
    BoardListener,
    ColumnListener,
    TaskListener
  ]
})
export class NotificationModule {}
