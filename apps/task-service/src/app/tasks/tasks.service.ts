import {
  Column,
  JWTUser,
  RabbitmqService,
  Task,
  TTaskEventType,
  User
} from '@kanban-board/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Column)
    private readonly columnsRepository: Repository<Column>,

    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,

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
      relations: ['board']
    });
    if (!column) throw new NotFoundException('Column not found');

    const board = column.board;
    if (!board) throw new NotFoundException('Board not found');

    const isAdmin = jwtUser.role === 'admin';
    const isOwner = board.ownerId === jwtUser.sub;
    const isShared = board.sharedUsers?.some((u) => u.id === jwtUser.sub);

    if (!isOwner && !isAdmin && !isShared) {
      throw new ForbiddenException('You do not have permission to add tasks');
    }

    const lastTask = await this.tasksRepository.findOne({
      where: { column: { id: columnId } },
      order: { position: 'DESC' },
      select: ['id', 'position']
    });
    const newPosition = (lastTask?.position ?? -1) + 1;

    const owner = await this.usersRepository.findOne({
      where: { id: jwtUser.sub },
      select: ['id', 'email']
    });

    if (!owner) throw new NotFoundException('Owner not found');

    let assignees: User[] = [];
    if (dto.assigneeIds?.length) {
      const validAssigneeIds = [board.ownerId, ...(board.sharedUserIds || [])];

      const invalidIds = dto.assigneeIds.filter(
        (id) => !validAssigneeIds.includes(id)
      );
      if (invalidIds.length > 0) {
        throw new BadRequestException(
          'Some assignees do not have access to this board'
        );
      }

      assignees = await this.usersRepository.find({
        where: { id: In(dto.assigneeIds) },
        select: ['id', 'email']
      });
    }

    if (!assignees.length) assignees = [owner];

    const task = this.tasksRepository.create({
      title: dto.title,
      description: dto.description,
      owner,
      board,
      column,
      assignees,
      assigneeIds: assignees.map(({ id }) => id),
      assigneeEmails: assignees.map((u) => u.email),
      position: newPosition
    });

    try {
      await this.tasksRepository.save(task);
    } catch (err) {
      const errMsg = 'Failed to create task';
      this.logger.error(errMsg, err);
      throw new InternalServerErrorException(errMsg);
    }

    const taskRes = {
      id: task.id,
      title: task.title,
      description: task.description,

      assignees: task.assignees,
      assigneeIds: task.assignees.map(({ id }) => id),
      ownerId: owner.id,
      boardId: board.id,
      columnId: task.columnId,

      isDone: task.isDone,

      position: task.position,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };

    this.rmqService
      .publish('kanban_exchange', 'task.created', {
        task: taskRes,
        createdBy: jwtUser.sub
      })
      .catch((err) => {
        this.logger.error('Failed to publish task.created event', err);
      });

    return taskRes;
  }

  async update(taskId: string, updateTaskDto: UpdateTaskDto, jwtUser: JWTUser) {
    const task = await this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .leftJoinAndSelect('task.owner', 'owner')
      .select([
        'task.id',
        'task.title',
        'task.description',
        'task.isDone',
        'task.ownerId',
        'task.boardId',
        'task.columnId',
        'task.createdAt',
        'task.updatedAt',
        'task.position',
        'assignee'
      ])
      .where('task.id = :taskId', { taskId })
      .getOne();

    if (!task) throw new NotFoundException('Task not found');

    // Update simple fields
    if (updateTaskDto.title !== undefined) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }

    // update completed;
    task.isDone = updateTaskDto.isDone;
    task.completedAt = task.isDone ? new Date() : null;

    // Update assignees if provided
    if (updateTaskDto.assigneeIds !== undefined) {
      if (updateTaskDto.assigneeIds?.length) {
        const assignees = await this.usersRepository.find({
          where: { id: In(updateTaskDto.assigneeIds) }
        });

        // Check if all requested assignees were found
        if (assignees.length !== updateTaskDto.assigneeIds.length) {
          throw new NotFoundException('One or more assignees not found');
        }

        task.assignees = assignees;
        task.assigneeIds = assignees.map(({ id }) => id);
      } else {
        task.assignees = [];
      }
    }

    const savedTask = await this.tasksRepository.save(task);
    const taskRes = {
      ...savedTask,
      assigneeIds: savedTask.assignees.map(({ id }) => id)
    };
    this.rmqService
      .publish<TTaskEventType>('kanban_exchange', 'task.updated', {
        task: taskRes,
        createdBy: jwtUser.sub
      })
      .catch((err) => {
        this.logger.error('Failed to publish task.created event', err);
      });

    return taskRes;
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

    this.rmqService.publish<TTaskEventType>('kanban_exchange', 'task.deleted', {
      task,
      createdBy: jwtUser.sub,
      assignedTo: task.assignees?.map((a) => a.id) || []
    });
    return { message: 'Task deleted successfully', id };
  }

  async moveOrReorderTask(
    taskId: string,
    columnId: string,
    position?: number,
    jwtUser?: JWTUser
  ) {
    const task = await this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .leftJoinAndSelect('task.owner', 'owner')
      .leftJoinAndSelect('task.column', 'column')
      .leftJoinAndSelect('column.tasks', 'columnTask')
      .leftJoinAndSelect('task.board', 'board')
      .leftJoinAndSelect('board.sharedUsers', 'sharedUser')
      .leftJoinAndSelect('board.owner', 'boardOwner')
      .where('task.id = :taskId', { taskId })
      .getOne();

    if (!task) throw new NotFoundException('Task not found');

    const homeColumnId = task.columnId;
    const board = task.board;

    // Permission check
    const hasAccess =
      jwtUser?.role === 'admin' ||
      board.sharedUsers?.some(({ id }) => id === jwtUser.sub);
    if (!hasAccess) throw new ForbiddenException('No permission');

    // MOVE TO NEW COLUMN
    if (columnId && columnId !== task.columnId) {
      const oldColumn = task.column;
      const newColumn = await this.columnsRepository.findOne({
        where: { id: columnId },
        relations: ['tasks']
      });
      if (!newColumn) throw new NotFoundException('Target column not found');

      // Update column reference
      task.column = newColumn;
      task.columnId = newColumn.id;

      // Handle completedAt status based on column type
      if (newColumn.isDone && !task.isDone) {
        task.completedAt = new Date();
        task.isDone = true;
      }

      // Insert into new column (at given position or at bottom)
      const newColumnTasks = [...newColumn.tasks].sort(
        (a, b) => a.position - b.position
      );
      const insertPosition =
        typeof position === 'number'
          ? Math.min(Math.max(position, 0), newColumnTasks.length)
          : newColumnTasks.length;
      newColumnTasks.splice(insertPosition, 0, task);

      // Reindex all tasks in new column
      this.reindexTasks(newColumnTasks);
      await this.tasksRepository.save(newColumnTasks);

      // Reindex old column tasks
      if (oldColumn?.tasks) {
        const oldColumnTasks = oldColumn.tasks
          .filter((t) => t.id !== task.id)
          .sort((a, b) => a.position - b.position);
        this.reindexTasks(oldColumnTasks);
        await this.tasksRepository.save(oldColumnTasks);
      }
    }

    // REORDER IN SAME COLUMN
    else if (position !== undefined) {
      const column = task.column;
      const tasksInColumn = column.tasks
        .filter((t) => t.id !== task.id)
        .sort((a, b) => a.position - b.position);

      const newPosition = Math.min(Math.max(position, 0), tasksInColumn.length);
      tasksInColumn.splice(newPosition, 0, task);

      this.reindexTasks(tasksInColumn);
      await this.tasksRepository.save(tasksInColumn);

      task.position = newPosition;
    }

    const taskRes = {
      id: task.id,
      title: task.title,
      description: task.description,
      columnId: task.column.id,
      position: task.position,
      isDone: task.isDone,
      completedAt: task.completedAt,
      assignees:
        task.assignees?.map((u) => ({ id: u.id, email: u.email })) || [],
      assigneeIds: task.assignees.map(({ id }) => id),
      owner: {
        id: task.owner.id,
        email: task.owner.email
      }
    };

    this.rmqService.publish<TTaskEventType>('kanban_exchange', 'task.moved', {
      task: taskRes,
      homeColumnId,
      createdBy: jwtUser?.sub
    });

    return taskRes;
  }

  private reindexTasks(tasks: Task[]) {
    tasks.forEach((t, i) => (t.position = i));
  }
}
