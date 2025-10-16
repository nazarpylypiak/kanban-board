import { IBoard } from './board.interface';
import { ITask } from './task.interface';

export interface IColumn {
  id: string;
  name: string;

  board?: IBoard | null;
  boardId: string;

  tasks?: ITask[] | null;

  isDone: boolean;

  createdAt: string;
  updatedAt: string;
}

export type TColumnEventType = 'column.added' | 'column.deleted';

export type TColumnNotificationType = 'COLUMN_ADDED' | 'COLUMN_DELETED';

export interface INotificationColumn {
  id: string;
  name: string;
  boardId: string;
  isDone: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface IColumnNotificationPayload {
  column?: INotificationColumn;
  columnId?: string;
}

export interface IColumnNotificationWrapper {
  type: TColumnNotificationType;
  eventType: TColumnEventType;
  payload: IColumnNotificationPayload;
}
