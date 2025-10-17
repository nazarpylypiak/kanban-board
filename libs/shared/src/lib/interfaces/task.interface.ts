import { IBoard } from './board.interface';
import { IColumn } from './column.interface';
import { IUser } from './user.interface';

export interface ITask {
  id: string;
  title: string;
  description?: string | null;

  assignees?: IUser[] | null;
  assigneeIds?: string[] | null;
  assigneeEmails?: string[] | null;

  owner?: IUser | null;
  ownerId: string;

  board?: IBoard | null;
  boardId: string;

  column?: IColumn | null;
  columnId: string;

  completedAt?: string | null;
  isDone: boolean;

  position: number;
  createdAt: string;
  updatedAt: string;
}

export type TTaskEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.deleted'
  | 'task.moved';

export type TTaskNotificationType =
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'TASK_MOVED';

export interface INotificationTask {
  id: string;
  title: string;
  isDone: boolean;
  position: number;

  boardId: string;
  columnId: string;
  assignees: { id: string; email: string }[];

  createdAt: string;
  updatedAt: string;
}

export interface ITaskNotificationPayload {
  task?: INotificationTask;
  taskId?: string;
  homeColumnId?: string;
}

export interface ITaskNotificationWrapper {
  type: TTaskNotificationType;
  eventType: TTaskEventType;
  payload: ITaskNotificationPayload;
}
