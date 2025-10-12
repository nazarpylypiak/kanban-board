import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'notifications' })
@Injectable()
export class NotificationGateway {
  @WebSocketServer() server: Server;

  sendToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@MessageBody() data: { userId: string }) {
    const socket = this.server.sockets.sockets.get(data.userId);
    socket?.join(data.userId);
  }
}
