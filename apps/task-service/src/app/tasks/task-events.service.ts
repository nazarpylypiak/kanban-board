import {
  INotification,
  ITaskNotificationWrapper,
  JWTUser,
  RabbitmqService,
  Task
} from '@kanban-board/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskEventsService {
  constructor(private readonly rmqService: RabbitmqService) {}

  private buildCreateMessage(
    task: Task,
    currentUser: JWTUser
  ): INotification<ITaskNotificationWrapper> {
    return {
      eventType: 'task.created',
      type: 'TASK_CREATED',
      payload: {
        task: {
          id: task.id,
          title: task.title,
          isDone: task.isDone,
          position: task.position,

          assignees: task.assignees.map(({ id, email }) => ({ id, email })),
          columnId: task.columnId,
          boardId: task.boardId,

          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString()
        }
      },
      adminIds: [task.board.ownerId],
      createdBy: currentUser.sub,
      recipientIds: task.assigneeIds,
      timestamp: new Date().toISOString()
    };
  }

  publishCreateTask(task: Task, currentUser: JWTUser) {
    const msg = this.buildCreateMessage(task, currentUser);

    return this.rmqService.publish<INotification<ITaskNotificationWrapper>>(
      'kanban_exchange',
      'task.created',
      msg
    );
  }

  private buildDeleteMessage(
    task: Task,
    currentUser: JWTUser
  ): INotification<ITaskNotificationWrapper> {
    const recipientIds = task.board.sharedUsers?.map(({ id }) => id) ?? [];
    const adminIds = task?.board?.ownerId ? [task.board.ownerId] : [];

    return {
      eventType: 'task.deleted',
      type: 'TASK_DELETED',
      payload: {
        taskId: task.id
      },
      adminIds,
      recipientIds,
      createdBy: currentUser.sub,
      timestamp: new Date().toISOString()
    };
  }

  publishDeleteTask(task: Task, currentUser: JWTUser) {
    const msg = this.buildDeleteMessage(task, currentUser);

    return this.rmqService.publish<INotification<ITaskNotificationWrapper>>(
      'kanban_exchange',
      'task.deleted',
      msg
    );
  }

  buildMoveMessage(
    task: Task,
    currentUser: JWTUser,
    homeColumnId: string
  ): INotification<ITaskNotificationWrapper> {
    const assignees = task.assignees.map(({ id, email }) => ({ id, email }));
    const assigneeIds = assignees.map(({ id }) => id);

    return {
      eventType: 'task.moved',
      type: 'TASK_MOVED',
      payload: {
        task: {
          id: task.id,
          title: task.title,
          isDone: task.isDone,
          position: task.position,

          assignees,
          columnId: task.columnId,
          boardId: task.boardId,

          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString()
        },
        homeColumnId
      },
      adminIds: [task.board.ownerId],
      createdBy: currentUser.sub,
      recipientIds: assigneeIds,
      timestamp: new Date().toISOString()
    };
  }

  publishMoveTask(task: Task, currentUser: JWTUser, homeColumnId: string) {
    const msg = this.buildMoveMessage(task, currentUser, homeColumnId);

    return this.rmqService.publish<INotification<ITaskNotificationWrapper>>(
      'kanban_exchange',
      'task.moved',
      msg
    );
  }
}
