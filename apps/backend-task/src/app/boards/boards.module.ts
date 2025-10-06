import { User } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, User, Task]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN') || '1h'
        }
      })
    })
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService]
})
export class BoardsModule {}
