import { IUserNotificationEvent } from '@kanban-board/shared';
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

  @SubscribeMessage('subscribeAdmin')
  handleJoinAdmin(
    @MessageBody() data: { adminId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(`notify:admin:${data.adminId}`);
    this.logger.log(`📥 Admin joined room notify:admin:${data.adminId}`);
  }

  sendToUser(userId: string, event: IUserNotificationEvent) {
    const roomName = `notify:${userId}`;
    this.server.to(roomName).emit('notification', event);
  }

  async notifyAdmins(adminIds: string[] | null, event: IUserNotificationEvent) {
    if (!adminIds || adminIds.length === 0) {
      this.logger.warn('No admin IDs provided for notification');
      return;
    }
    for (const adminId of adminIds) {
      this.server.to(`notify:admin:${adminId}`).emit('notification', {
        ...event,
        timestamp: new Date().toISOString()
      });
    }
  }
}
