import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@WebSocketGateway({
  imports: [ConfigModule],
  cors: {
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      const configService = new ConfigService(); // Instantiate ConfigService
      const allowedOriginsString = configService.get<string>('CORS_ORIGINS');
      const allowedOrigins = allowedOriginsString
        ? allowedOriginsString.split(',').map((c) => c.trim())
        : [];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  },
})
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  constructor(private tasksService: TasksService) {}

  @SubscribeMessage('createTask')
  async create(@MessageBody() dto: CreateTaskDto) {
    const task = await this.tasksService.create(dto);
    this.server.emit('taskCreated', task);
    return task;
  }

  @SubscribeMessage('updateTask')
  async update(@MessageBody() dto: { id: string; task: UpdateTaskDto }) {
    const task = await this.tasksService.update(dto.id, dto.task);
    this.server.emit('taskUpdated', task);
    return task;
  }

  @SubscribeMessage('deleteTask')
  async remove(@MessageBody() id: string) {
    await this.tasksService.delete(id);
    this.server.emit('taskDeleted', id);
    return id;
  }
}
