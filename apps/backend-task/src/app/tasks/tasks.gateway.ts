import { ITask } from '@kanban-board/shared';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnlineUsersService } from '../shared/online-users.service';

@WebSocketGateway(3003, { namespace: 'tasks' })
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private onlineUsers: OnlineUsersService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) this.onlineUsers.set(userId, client.id);
    this.server.to(userId).emit('connected');
  }

  handleDisconnect(client: Socket) {
    this.onlineUsers.removeBySocket(client.id);
  }

  notifyTaskCreated(task: ITask) {
    task.assignees.forEach((user) => {
      const socketId = this.onlineUsers.get(user.id);
      if (socketId) {
        this.server.to(socketId).emit('taskCreated', {
          id: task.id,
          title: task.title,
          description: task.description,
          position: task.position,
          columnId: task.columnId,
          assignees: task.assignees
        });
      }
    });
  }
}
