import { Module } from '@nestjs/common';
import { OnlineUsersService } from './online-users.service';

@Module({
  providers: [OnlineUsersService],
  exports: [OnlineUsersService]
})
export class OnlineUsersModule {}
