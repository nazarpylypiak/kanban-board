import { IColumn } from './column.interface';
import { ITask } from './task.interface';
import { IUser } from './user.interface';

export interface IBoard {
  id: string;
  name: string;
  owner: IUser | null;
  ownerId: string;

  sharedUsers?: IUser[] | null;
  sharedUserIds?: string[] | null;

  columns?: IColumn[] | null;

  tasks?: ITask[] | null;
}

export type TBoardEventType = 'board.shared' | 'board.deleted';

export type TBoardNotificationType = 'BOARD_SHARED' | 'BOARD_DELETED';
export interface INotificationBoard {
  id: string;
  name: string;
  ownerId: string;
  sharedUserIds: string[];
}
export interface INotificationPayload {
  board?: INotificationBoard;
  boardId?: string;
}
export interface IBoardNotification {
  eventType: TBoardEventType;
  type: TBoardNotificationType;
  payload: INotificationPayload;
  createdBy: string;
  recipientIds: string[];
  adminIds: string[];
  timestamp: string;
  message?: string;
}

export type IBoardUserEvent = Omit<
  IBoardNotification,
  'recipientIds' | 'adminIds'
>;
