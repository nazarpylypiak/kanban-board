import { IUser } from './user.interface';

export interface ITask {
  id?: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
  assignees?: IUser[];
  owner: IUser;
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
