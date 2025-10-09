import { JWTUser, User } from '@kanban-board/shared';
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
    return this.tasksRepository.find({ order: { position: 'ASC' } });
  }

  async findOne(id: string) {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(columnId: string, dto: CreateTaskDto, jwtUser: JWTUser) {
    const column = await this.columnsRepository.findOne({
      where: { id: columnId },
      relations: ['tasks', 'board', 'board.owner']
    });
    if (!column) throw new NotFoundException('Column not found');

    const board = column.board;
    if (!board) throw new NotFoundException('Board not found');

    if (jwtUser.role !== 'admin' && board.owner.id !== jwtUser.sub) {
      throw new ForbiddenException('You do not have permission to add tasks');
    }

    const newPosition =
      column.tasks?.length > 0
        ? Math.max(...column.tasks.map(({ position }) => position)) + 1
        : 0;

    const task = this.tasksRepository.create({
      ...dto,
      column,
      columnId,
      position: newPosition
    });

    if (dto.assigneeId) {
      const assignee = await this.tasksRepository.manager
        .getRepository<User>('user')
        .findOneBy({ id: dto.assigneeId });
      if (!assignee) throw new NotFoundException('Assignee not found');
      task.assignee = assignee;
    }

    return this.tasksRepository.save(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignee']
    });

    if (!task) throw new NotFoundException('Task not found');

    if (updateTaskDto.title !== undefined) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined)
      task.description = updateTaskDto.description;

    if (updateTaskDto.assigneeId !== undefined) {
      if (updateTaskDto.assigneeId === null) {
        task.assignee = null;
      } else {
        const assignee = await this.tasksRepository.manager
          .getRepository(User)
          .findOneBy({ id: updateTaskDto.assigneeId });
        if (!assignee) throw new NotFoundException('Assignee not found');
        task.assignee = assignee;
      }
    }

    return this.tasksRepository.save(task);
  }

  async delete(id: string) {
    const result = await this.tasksRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Task not found');
  }

  async moveOrReorderTask(
    taskId: string,
    columnId: string,
    position?: number,
    jwtUser?: JWTUser
  ) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: [
        'column',
        'column.tasks',
        'column.board',
        'column.board.owner'
      ]
    });

    if (!task) throw new NotFoundException('Task not found');

    const board = task.column.board;
    if (jwtUser?.role !== 'admin' && board.owner.id !== jwtUser?.sub) {
      throw new ForbiddenException('No permission');
    }

    // Moving to a new column
    if (columnId && columnId !== task.columnId) {
      const newColumn = await this.columnsRepository.findOne({
        where: { id: columnId },
        relations: ['tasks']
      });
      if (!newColumn) throw new NotFoundException('Target column not found');
      task.column = newColumn;
      task.columnId = newColumn.id;

      // Reassign position in new column
      const maxPosition = newColumn.tasks.length
        ? Math.max(...newColumn.tasks.map((t) => t.position))
        : -1;
      task.position = maxPosition + 1;

      // Reorder old column tasks
      const oldColumnTasks = task.column.tasks
        .filter((t) => t.id !== task.id)
        .sort((a, b) => a.position - b.position);
      oldColumnTasks.forEach((t, i) => (t.position = i));
      await this.tasksRepository.save(oldColumnTasks);
    }

    // Reordering in the same column
    if (position !== undefined && (!columnId || columnId === task.columnId)) {
      const tasksInColumn = task.column.tasks
        .filter((t) => t.id !== task.id)
        .sort((a, b) => a.position - b.position);

      tasksInColumn.splice(position, 0, task);
      tasksInColumn.forEach((t, i) => (t.position = i));
      await this.tasksRepository.save(tasksInColumn);
      task.position = position;
    }

    return task;
  }
}
