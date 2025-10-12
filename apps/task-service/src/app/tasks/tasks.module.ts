import { RMQModule, User } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from '../columns/entities/column.entity';
import { Task } from './entities/task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Column, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN') || '1h'
        }
      })
    }),
    RMQModule
  ],
  controllers: [TasksController],
  providers: [TasksService]
})
export class TasksModule {}
