import { ITask } from '@kanban-board/shared';
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
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  @SubscribeMessage('joinUser')
  handleJoinUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(`user:${data.userId}`);
    console.log(`User ${data.userId} joined their room`);
  }

  @SubscribeMessage('leaveUser')
  handleLeaveUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.leave(`user:${data.userId}`);
    console.log(`User ${data.userId} leaved their room`);
  }

  handleConnection(client: Socket) {
    client.emit('connected');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }

  notifyTaskCreated(task: ITask) {
    task.assignees.forEach((user) => {
      if (user.id !== task.owner.id) {
        this.server.to(`user:${user.id}`).emit('taskCreated', {
          id: task.id,
          title: task.title,
          description: task.description,
          position: task.position,
          columnId: task.columnId,
          assignees: task.assignees,
          owner: task.owner
        });
      }
    });
  }

  notifyTaskMoved(task: ITask) {
    task.assignees.forEach((user) => {
      if (user.id !== task.owner.id) {
        this.server.to(`user:${user.id}`).emit('taskMoved', task);
      }
    });
  }

  notifyTaskDeleted(task: ITask) {
    task.assignees.forEach((user) => {
      if (user.id !== task.owner.id) {
        this.server
          .to(`user:${user.id}`)
          .emit('taskDeleted', { taskId: task.id });
      }
    });
  }
}
