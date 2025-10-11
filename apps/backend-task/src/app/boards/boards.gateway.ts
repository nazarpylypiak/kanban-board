import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnlineUsersService } from '../shared/online-users.service';

@WebSocketGateway(3003, { namespace: 'boards' })
export class BoardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private onlineUsers: OnlineUsersService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) this.onlineUsers.set(userId, client.id);
  }

  handleDisconnect(client: Socket) {
    this.onlineUsers.removeBySocket(client.id);
  }

  notifyBoardShared(board: any) {
    // Notify all shared users
    board.sharedUsers.forEach((user) => {
      const socketId = this.onlineUsers.get(user.id);
      if (socketId) {
        this.server.to(socketId).emit('board-shared', board);
      }
    });
  }

  notifyBoardRemoved(boardId: string, userId: string) {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('board-removed', { boardId });
    }
  }
}
