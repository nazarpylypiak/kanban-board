import { JWTUser } from '@kanban-board/shared';
import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from '../columns/entities/column.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Column) private columnsRepository: Repository<Column>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>
  ) {}

  findAll() {
    return this.tasksRepository.find();
  }

  async findOne(id: string) {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(columnId: string, dto: CreateTaskDto, jwtUser: JWTUser) {
    const column = await this.columnsRepository.findOne({
      where: { id: columnId },
      relations: ['board', 'board.owner']
    });
    if (!column) throw new NotFoundException('Column not found');

    const board = column.board;
    if (!board) throw new NotFoundException('Board not found');

    if (jwtUser.role !== 'admin' && board.owner.id !== jwtUser.sub) {
      throw new ForbiddenException('You do not have permission to add tasks');
    }

    const task = this.tasksRepository.create({
      ...dto,
      column,
      columnId
    });

    return this.tasksRepository.save(task);
  }

  async update(id: string, updateTaskTdo: UpdateTaskDto) {
    await this.tasksRepository.update(id, updateTaskTdo);
    return this.findOne(id);
  }

  async delete(id: string) {
    const result = await this.tasksRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Task not found');
  }

  async moveTask(taskId: string, newColumnId: string, jwtUser: JWTUser) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['column', 'column.board', 'column.board.owner']
    });

    if (!task) throw new NotFoundException('Task not found');

    const newColumn = await this.columnsRepository.findOne({
      where: { id: newColumnId },
      relations: ['board', 'board.owner']
    });

    if (!newColumn) throw new NotFoundException('Target column not found');

    if (task.column.board.id !== newColumn.board.id) {
      throw new ForbiddenException('Cannot move task to another board');
    }

    const board = task.column.board;
    if (jwtUser.role !== 'admin' && board.owner.id !== jwtUser.sub) {
      throw new ForbiddenException('You do not have permission to move tasks');
    }

    task.column = newColumn;
    task.columnId = newColumnId;
    const { column, ...movedTask } = await this.tasksRepository.save(task);
    return movedTask;
  }
}
