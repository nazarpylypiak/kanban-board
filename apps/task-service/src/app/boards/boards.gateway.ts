import { Board } from '@kanban-board/shared';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3003)
export class BoardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  @SubscribeMessage('joinBoards')
  handleJoinUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(`board:${data.userId}`);
    console.log(`User ${data.userId} joined their room`);
  }

  @SubscribeMessage('leaveBoards')
  handleLeaveUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.leave(`board:${data.userId}`);
    console.log(`User board:${data.userId} leaved their room`);
  }

  handleConnection(client: Socket) {
    client.emit('Boards connected');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }

  notifyBoardShared(board: Board) {
    board.sharedUsers.forEach((user) => {
      if (user.id !== board.ownerId) {
        this.server.to(`board:${user.id}`).emit('boardShared', board);
      }
    });
  }

  notifyBoardUnshared(boardId: string, userId: string) {
    this.server.to(`board:${userId}`).emit('boardUnshared', { boardId });
  }
}
