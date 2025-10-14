import { IColumn } from './column.interface';
import { ITask } from './task.interface';
import { IUser } from './user.interface';

export interface IBoard {
  id: string;
  name: string;
  owner?: IUser | null;
  ownerId: string;

  sharedUsers?: IUser[] | null;
  sharedUserIds?: string[] | null;

  columns?: IColumn[] | null;

  tasks?: ITask[] | null;
}

export type TBoardEventType = 'board.shared' | 'board.unshared';
