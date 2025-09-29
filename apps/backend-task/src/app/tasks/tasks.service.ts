import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private configService: ConfigService
  ) {}

  findAll() {
    return this.taskRepository.find();
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(createTaskTdo: CreateTaskDto) {
    const task = this.taskRepository.create(createTaskTdo);
    return this.taskRepository.save(task);
  }

  async update(id: string, updateTaskTdo: UpdateTaskDto) {
    await this.taskRepository.update(id, updateTaskTdo);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Task not found');
  }
}
