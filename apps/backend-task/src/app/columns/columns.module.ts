import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../boards/entities/board.entity';
import { Task } from '../tasks/entities/task.entity';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { Column } from './entities/column.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Column, Board, Task]),
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
  controllers: [ColumnsController],
  providers: [ColumnsService]
})
export class ColumnsModule {}
