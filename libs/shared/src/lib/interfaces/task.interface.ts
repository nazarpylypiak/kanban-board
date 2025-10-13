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

export type ITaskEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.deleted'
  | 'task.moved';
export interface ITaskEvent {
  type: ITaskEventType;
  task: ITask;
  homeColumnId?: string;
  createdBy: string;
  assignedTo?: string[];
  timestamp?: string;
}
