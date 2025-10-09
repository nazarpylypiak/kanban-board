import { IColumn } from './column.interface';
import { IUser } from './user.interface';

export interface IBoard {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  columns?: IColumn[];
  sharedUsers: IUser[];
  owner: IUser;
}
