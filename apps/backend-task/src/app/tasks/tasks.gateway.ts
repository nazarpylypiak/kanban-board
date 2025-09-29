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
    origin: [],
  },
})
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly configService: ConfigService,
    private tasksService: TasksService
  ) {
    const origin = this.configService.get<string>('CORS_ORIGIN');
    this.server.engine.opts.cors = { origin };
  }

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
