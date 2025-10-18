import {
  IBoardNotificationWrapper,
  IColumnNotificationWrapper,
  INotificationUser,
  ITaskNotificationWrapper,
  LoggerService
} from '@kanban-board/shared';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

@WebSocketGateway()
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private logger = this.loggerService.child({
    context: NotificationGateway.name
  });
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly loggerService: LoggerService,
    private readonly jwtService: JwtService
  ) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (!token) throw new Error('Missing token');

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;
      const role = payload.role || 'UnknownRole';
      client.data.user = payload;

      this.connectedUsers.set(userId, client.id);

      this.logger.log(`🟢 User connected: sub=${userId}, role=${role}`);
      client.emit('connected');
    } catch (error) {
      this.logger.warn(`⚠️ Unauthorized socket connection: ${error.message}`);
      client.emit('unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    client.emit('disconnected');
    this.logger.log(`🔴 Client ${client.id} disconnected`);
  }

  @SubscribeMessage('subscribe')
  handleJoinUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(`notify:${data.userId}`);
    this.logger.log(`📥 User joined room notify:${data.userId}`);
  }

  @SubscribeMessage('unsubscribe')
  handleLeaveUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.leave(`notify:${data.userId}`);
    this.logger.log(`📤 User left room notify:${data.userId}`);
  }

  @SubscribeMessage('subscribeAdmin')
  handleJoinAdmin(
    @MessageBody() data: { adminId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(`notify:admin:${data.adminId}`);
    this.logger.log(`📥 Admin joined room notify:admin:${data.adminId}`);
  }

  @SubscribeMessage('unsubscribeAdmin')
  handleLeaveAdmin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.leave(`notify:admin:${data.userId}`);
    this.logger.log(`📤 Admin left room notify:${data.userId}`);
  }

  async sendToUsers(
    userIds: string[],
    event: INotificationUser<
      | IBoardNotificationWrapper
      | IColumnNotificationWrapper
      | ITaskNotificationWrapper
    >
  ) {
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
          // this.logger.log(
          //   `📤 WebSocket notification sent to user ${userId} for ${event.eventType}`
          // );
        } catch (err) {
          this.logger.error(`Failed to notify user ${userId}`, err.stack);
        }
      })
    );
  }

  async notifyAdmins(
    adminIds: string[] | null,
    event: INotificationUser<
      | IBoardNotificationWrapper
      | IColumnNotificationWrapper
      | ITaskNotificationWrapper
    >
  ) {
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
          // this.logger.log(
          //   `📤 WebSocket notification sent to admin ${adminId} for ${event.eventType}`
          // );
        } catch (err) {
          this.logger.error(`Failed to notify admin ${adminId}`, err.stack);
        }
      })
    );
  }
}
