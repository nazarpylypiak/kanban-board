import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3003, { cors: true })
export class BoardsGateway {
  @WebSocketServer()
  server: Server;

  // Map userId => socketId
  private onlineUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.onlineUsers.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        break;
      }
    }
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
