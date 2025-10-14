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

export interface ITaskEventPayload {
  task: ITask;
  createdBy: string;
}

export interface ITaskUserEventPayload extends ITaskEventPayload {
  timestamp: string;
  eventType: TTaskEventType;
}
