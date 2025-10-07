import { ITask } from './task.interface';

export interface IColumn {
  id: string;
  name: string;
  boardId: string;
  tasks?: ITask[];
}
