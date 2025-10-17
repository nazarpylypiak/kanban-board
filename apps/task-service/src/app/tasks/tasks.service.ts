import {
  Column,
  JWTUser,
  Task,
  TaskResponseDto,
  User
} from '@kanban-board/shared';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DataSource, In, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPolicy } from './policies/task.policy';
import { TaskEventsService } from './task-events.service';
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
    private readonly dataSource: DataSource,
    private readonly taskEventsService: TaskEventsService
  ) {}

  findAll() {
    return this.tasksRepository.find({ order: { position: 'ASC' } });
  }

  async findOne(id: string) {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(columnId: string, dto: CreateTaskDto, currentUser: JWTUser) {
    let task: Task;
    const taskRes = await this.dataSource.transaction(async (manager) => {
      const column = await manager.findOne(Column, {
        where: { id: columnId },
        relations: ['board']
      });
      if (!column) {
        this.logger.warn(`Column ${columnId} not found`);
        throw new NotFoundException('Column not found');
      }

      const board = column.board;
      if (!board) {
        this.logger.warn(`Board ${column.boardId} not found`);
        throw new NotFoundException('Board not found');
      }

      TaskPolicy.assertCanCreate(board, currentUser);

      const lastTask = await manager.findOne(Task, {
        where: { column: { id: columnId } },
        order: { position: 'DESC' },
        select: ['id', 'position']
      });
      const newPosition = Math.max((lastTask?.position ?? -1) + 1, 0);

      const owner = await manager.findOne(User, {
        where: { id: currentUser.sub },
        select: ['id', 'email']
      });
      if (!owner) {
        this.logger.warn(`Owner with id ${currentUser.sub} not found`);
        throw new NotFoundException('Owner not found');
      }

      let assignees: User[] = [];
      if (dto.assigneeIds?.length) {
        const validAssigneeIds = [
          board.ownerId,
          ...(board.sharedUserIds || [])
        ];

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

      const taskEntity = this.tasksRepository.create({
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
        task = await this.tasksRepository.save(taskEntity);
      } catch (err) {
        const errMsg = 'Failed to create task';
        this.logger.error(errMsg, err);
        throw new InternalServerErrorException(errMsg);
      }

      return plainToInstance(TaskResponseDto, task, {
        excludeExtraneousValues: true
      });
    });

    try {
      await this.taskEventsService.publishCreateTask(task, currentUser);
    } catch (err) {
      this.logger.error('Failed to publish task.created event', err);
    }

    return taskRes;
  }

  async update(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
    currentUser: JWTUser
  ) {
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

    TaskPolicy.assertCanUpdate(task, currentUser);
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
    // this.rmqService
    //   .publish<TTaskEventType>('kanban_exchange', 'board.task.updated', {
    //     payload: { task: taskRes },
    //     createdBy: jwtUser.sub,
    //     recipientIds: taskRes.assigneeIds
    //   })
    //   .catch((err) => {
    //     this.logger.error('Failed to publish task.created event', err);
    //   });

    return taskRes;
  }

  async delete(id: string, currentUser: JWTUser) {
    const taskRes = await this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(Task, {
        where: { id },
        relations: [
          'assignees',
          'owner',
          'board',
          'board.owner',
          'board.sharedUsers'
        ]
      });
      if (!task) throw new NotFoundException('Task not found');

      TaskPolicy.assertCanDelete(task, currentUser);

      await manager.delete(Task, id);

      return task;
    });

    try {
      await this.taskEventsService.publishDeleteTask(taskRes, currentUser);
    } catch (err) {
      this.logger.error('Failed to publish task.deleted event', err);
    }
    return { message: 'Task deleted successfully', id };
  }

  async moveOrReorderTask(
    taskId: string,
    columnId: string,
    position?: number,
    currentUser?: JWTUser
  ) {
    let homeColumnId: string;

    const taskRes = await this.dataSource.transaction(async (manager) => {
      const task = await manager
        .createQueryBuilder(Task, 'task')
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
      if (!task.board) throw new NotFoundException('Board not found');

      homeColumnId = task.columnId;

      TaskPolicy.assertCanMove(task, currentUser);

      // --- MOVE TO NEW COLUMN ---
      if (columnId && columnId !== task.columnId) {
        const oldColumn = task.column;
        const newColumn = await this.columnsRepository.findOne({
          where: { id: columnId },
          relations: ['tasks']
        });
        if (!newColumn) throw new NotFoundException('Target column not found');

        // Update ownership
        task.column = newColumn;
        task.columnId = newColumn.id;

        // Handle done/undo-done state
        if (newColumn.isDone && !task.isDone) {
          task.completedAt = new Date();
          task.isDone = true;
        } else if (!newColumn.isDone && task.isDone) {
          task.completedAt = null;
          task.isDone = false;
        }

        const newColumnTasks = this.sortByPosition(newColumn.tasks);
        const insertPosition =
          typeof position === 'number'
            ? Math.min(Math.max(position, 0), newColumnTasks.length)
            : newColumnTasks.length;

        newColumnTasks.splice(insertPosition, 0, task);
        this.reindexTasks(newColumnTasks);

        const oldColumnTasks =
          oldColumn?.tasks
            ?.filter((t) => t.id !== task.id)
            .sort((a, b) => a.position - b.position) ?? [];

        this.reindexTasks(oldColumnTasks);

        await Promise.all([
          manager.save(newColumnTasks),
          oldColumnTasks.length
            ? manager.save(oldColumnTasks)
            : Promise.resolve()
        ]);
      }

      // --- REORDER IN SAME COLUMN ---
      else if (position !== undefined) {
        const column = task.column;
        const tasksInColumn = column.tasks
          .filter((t) => t.id !== task.id)
          .sort((a, b) => a.position - b.position);

        const newPosition = Math.min(
          Math.max(position, 0),
          tasksInColumn.length
        );
        tasksInColumn.splice(newPosition, 0, task);

        this.reindexTasks(tasksInColumn);
        await manager.save(tasksInColumn);

        task.position = newPosition;
      }

      return task;
    });

    try {
      await this.taskEventsService.publishMoveTask(
        taskRes,
        currentUser,
        homeColumnId
      );
    } catch (err) {
      this.logger.error('Failed to publish task.move event', err);
    }

    return plainToInstance(TaskResponseDto, taskRes, {
      excludeExtraneousValues: true
    });
  }

  private reindexTasks(tasks: Task[]) {
    tasks.forEach((t, i) => (t.position = i));
  }

  private sortByPosition(tasks: Task[]) {
    return [...tasks].sort((a, b) => a.position - b.position);
  }
}
