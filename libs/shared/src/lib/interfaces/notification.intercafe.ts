import {
  IBoardNotification,
  IBoardUserEvent,
  TBoardEventType
} from './board.interface';

export type IRabbitMessage = IBoardNotification;
export type IRabbitKey = TBoardEventType;
export type INotification = IBoardUserEvent;
