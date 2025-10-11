import { IUser } from './user.interface';

export interface ITask {
  id?: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
  assignees?: IUser[];
}
