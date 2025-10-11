import { Injectable } from '@nestjs/common';

@Injectable()
export class OnlineUsersService {
  private onlineUsers = new Map<string, string>();

  set(userId: string, socketId: string) {
    this.onlineUsers.set(userId, socketId);
  }

  removeBySocket(socketId: string) {
    for (const [userId, id] of this.onlineUsers.entries()) {
      if (id === socketId) {
        this.onlineUsers.delete(userId);
        break;
      }
    }
  }

  get(userId: string) {
    return this.onlineUsers.get(userId);
  }
}
