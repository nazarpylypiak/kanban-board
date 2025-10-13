import { Board, Column, User } from '@kanban-board/shared';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsController } from './boards.controller';
import { BoardsGateway } from './boards.gateway';
import { BoardsService } from './boards.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, User, Column]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtSignOptions =>
        ({
          secret: config.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN') || '1h'
          }
        }) as JwtSignOptions
    })
  ],
  controllers: [BoardsController],
  providers: [BoardsService, BoardsGateway],
  exports: [BoardsService]
})
export class BoardsModule {}
