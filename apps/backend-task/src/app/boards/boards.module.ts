import { User } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from '../columns/entities/column.entity';
import { OnlineUsersModule } from '../shared/online-users.module';
import { BoardsController } from './boards.controller';
import { BoardsGateway } from './boards.gateway';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, User, Column]),
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
    OnlineUsersModule
  ],
  controllers: [BoardsController],
  providers: [BoardsService, BoardsGateway],
  exports: [BoardsService]
})
export class BoardsModule {}
