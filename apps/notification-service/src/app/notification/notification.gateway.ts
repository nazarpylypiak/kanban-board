import { IBoardUserEvent } from '@kanban-board/shared';
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
    this.logger.log(`Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    client.emit('disconnected');
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

  async sendToUsers(userIds: string[], event: IBoardUserEvent) {
    if (!userIds || userIds.length === 0) {
      this.logger.debug('No user IDs provided for notification');
      return;
    }

    const notification = {
      ...event,
      timestamp: new Date().toISOString()
    };

    await Promise.all(
      userIds.map(async (userId) => {
        try {
          this.server.to(`notify:${userId}`).emit('notification', notification);
          this.logger.log(
            `📤 WebSocket notification sent to user ${userId} for ${event.eventType}`
          );
        } catch (err) {
          this.logger.error(`Failed to notify user ${userId}`, err.stack);
        }
      })
    );
  }

  async notifyAdmins(adminIds: string[] | null, event: IBoardUserEvent) {
    if (!adminIds || adminIds.length === 0) {
      this.logger.warn('No admin IDs provided for notification');
      return;
    }

    const notification = {
      ...event,
      timestamp: new Date().toISOString()
    };

    await Promise.all(
      adminIds.map(async (adminId) => {
        try {
          this.server
            .to(`notify:admin:${adminId}`)
            .emit('notification', notification);
          this.logger.log(
            `📤 WebSocket notification sent to admin ${adminId} for ${event.eventType}`
          );
        } catch (err) {
          this.logger.error(`Failed to notify admin ${adminId}`, err.stack);
        }
      })
    );
  }
}
