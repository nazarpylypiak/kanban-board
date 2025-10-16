import {
  Board,
  Column,
  RMQModule,
  RolesGuard,
  Task
} from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnEventsService } from './column-events.service';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { ColumnPolicy } from './policies/column.policy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Column, Board, Task]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions =>
        ({
          secret: config.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
          }
        }) as JwtModuleOptions
    }),
    RMQModule
  ],
  controllers: [ColumnsController],
  providers: [
    ColumnsService,
    { provide: APP_GUARD, useClass: RolesGuard },
    ColumnEventsService,
    ColumnPolicy
  ]
})
export class ColumnsModule {}
