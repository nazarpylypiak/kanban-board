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
import { Task } from './entities/task.entity';

@WebSocketGateway(3003)
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  @SubscribeMessage('joinTasks')
  handleJoinUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(`task:${data.userId}`);
    console.log(`User task:${data.userId} joined their room`);
  }

  @SubscribeMessage('leaveTasks')
  handleLeaveUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.leave(`task:${data.userId}`);
    console.log(`User task:${data.userId} leaved their room`);
  }

  handleConnection(client: Socket) {
    client.emit('connected');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }

  notifyTaskCreated(task: Task, createdBy: string) {
    if (!task.assignees) task.assignees = [];

    const recipients = new Set<string>([
      task.owner.id,
      ...(task.assignees.map((u) => u.id) || []),
      ...(task.column.board.sharedUsers.map((u) => u.id) || []),
      task.column.board.owner.id
    ]);

    recipients.delete(createdBy);

    for (const userId of recipients) {
      this.server.to(`task:${userId}`).emit('taskCreated', {
        id: task.id,
        title: task.title,
        description: task.description,
        position: task.position,
        columnId: task.columnId,
        assignees: task.assignees,
        owner: task.owner
      });
    }
  }

  notifyTaskMoved(task: Task, homeColumnId: string, taskId: string) {
    [...task.assignees, task.board.owner].forEach((user) => {
      if (user.id !== taskId) {
        this.server
          .to(`task:${user.id}`)
          .emit('taskMoved', { task, homeColumnId });
      }
    });
  }

  notifyTaskDeleted(task: Task, deletedBy: string) {
    const board = task.board;
    if (!board) return;

    // Формуємо унікальний список користувачів
    const recipients = new Set<string>([
      board.owner.id,
      ...board.sharedUsers.map((u) => u.id),
      ...task.assignees.map((u) => u.id)
    ]);

    // Відправляємо подію всім, крім користувача, який видалив
    for (const userId of recipients) {
      if (userId !== deletedBy) {
        this.server.to(userId).emit('taskDeleted', { taskId: task.id });
      }
    }
  }
}
