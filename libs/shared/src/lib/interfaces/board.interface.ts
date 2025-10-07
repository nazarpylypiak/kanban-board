import { IColumn } from './column.interface';
import { IUser } from './user.interface';

export interface IBoard {
  id: string;
  name: string;
  description?: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
  columns?: IColumn[];
  owner: IUser;
}
