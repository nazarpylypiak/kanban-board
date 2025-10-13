import { Column, RMQModule, Task, User } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Column, User]),
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
  controllers: [TasksController],
  providers: [TasksService]
})
export class TasksModule {}
