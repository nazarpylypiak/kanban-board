import { ITaskUserEventPayload } from '@kanban-board/shared';
import { Injectable, Logger } from '@nestjs/common';
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

@WebSocketGateway(3005)
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    client.emit('connected');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('subscribe')
  handleJoinUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(`notify:${data.userId}`);
    this.logger.log(`📥 User joined room notify:${data.userId}`);
  }

  sendToUser(userId: string, payload: ITaskUserEventPayload) {
    const roomName = `notify:${userId}`;
    this.server.to(roomName).emit('notification', payload);
  }
}
