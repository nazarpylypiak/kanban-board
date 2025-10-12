import { JWTUser, RabbitmqService, User } from '@kanban-board/shared';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Column } from '../columns/entities/column.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksGateway } from './tasks.gateway';
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Column) private columnsRepository: Repository<Column>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private taskGateway: TasksGateway,
    private readonly rmqService: RabbitmqService
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
      relations: ['tasks', 'board', 'board.owner', 'board.sharedUsers']
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

    const owner = await this.tasksRepository.manager
      .getRepository(User)
      .findOne({ where: { id: jwtUser.sub } });
    if (!owner) throw new NotFoundException('Owner not found');
    const task = this.tasksRepository.create({
      ...dto,
      column,
      columnId,
      position: newPosition,
      owner,
      board
    });

    if (dto.assigneeIds) {
      const assignees = await this.tasksRepository.manager
        .getRepository<User>(User)
        .find({ where: { id: In(dto.assigneeIds) } });
      if (!assignees.length) throw new NotFoundException('Assignee not found');
      task.assignees = assignees;
    }
    const newTask = await this.tasksRepository.save(task);
    if (!newTask)
      throw new InternalServerErrorException('Failed to create task');

    this.taskGateway.notifyTaskCreated(task, jwtUser.sub);
    this.rmqService.publish('kanban_exchange', 'task.created', { task });

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      position: task.position,
      columnId: task.columnId,
      assignees: task.assignees,
      boardId: board.id,
      owner: {
        id: owner.id,
        email: owner.email
      }
    };
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignees', 'owner']
    });

    if (!task) throw new NotFoundException('Task not found');

    if (updateTaskDto.title !== undefined) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined)
      task.description = updateTaskDto.description;

    if (updateTaskDto.assigneeIds !== undefined) {
      if (updateTaskDto.assigneeIds.length === 0) {
        task.assignees = [];
      } else {
        const assignees = await this.tasksRepository.manager
          .getRepository(User)
          .find({ where: { id: In(updateTaskDto.assigneeIds) } });
        if (!assignees) throw new NotFoundException('Assignee not found');
        task.assignees = assignees;
      }
    }

    return this.tasksRepository.save(task);
  }

  async delete(id: string, jwtUser: JWTUser) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: [
        'assignees',
        'owner',
        'board',
        'board.owner',
        'board.sharedUsers'
      ]
    });
    if (task.owner.id !== jwtUser.sub && jwtUser.role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to delete this task'
      );
    }
    if (!task) throw new NotFoundException('Task not found');
    await this.tasksRepository.delete(id);
    this.taskGateway.notifyTaskDeleted(task, jwtUser.sub);
    return { message: 'Task deleted successfully', id };
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
        'assignees',
        'owner',
        'column.tasks',
        'board',
        'board.sharedUsers',
        'board.owner'
      ]
    });
    const homeColumnId = task.columnId;

    if (!task) throw new NotFoundException('Task not found');

    const board = task.board;
    if (
      jwtUser?.role !== 'admin' &&
      !board.sharedUsers?.some(({ id }) => id === jwtUser.sub)
    ) {
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

    this.taskGateway.notifyTaskMoved(task, homeColumnId, jwtUser.sub);

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      columnId: task.column.id,
      position: task.position,
      assignees:
        task.assignees?.map((u) => ({ id: u.id, email: u.email })) || [],
      owner: {
        id: task.owner.id,
        email: task.owner.email
      }
    };
  }
}
