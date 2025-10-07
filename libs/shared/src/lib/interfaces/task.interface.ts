import { TaskStatus } from '../enums';

export interface ITask {
  id?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  status?: TaskStatus;
  columnId: string;
}
