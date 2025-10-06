import { ITask } from "./task.interface";

export interface IBoard {
  id: string;
  name: string;
  description?: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
  tasks?: ITask[];
}
