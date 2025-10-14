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
