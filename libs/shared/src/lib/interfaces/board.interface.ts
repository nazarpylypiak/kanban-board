import { ITask } from './task.interface';
import { IUser } from './user.interface';

export interface IBoard {
  id: string;
  name: string;
  description?: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
  tasks?: ITask[];
  owner: IUser;
}
