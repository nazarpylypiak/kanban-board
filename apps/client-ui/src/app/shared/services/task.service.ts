import { ITask } from '@kanban-board/shared';
import { createApi } from '../../core/services/api';
import { TCreateTask, TUpdateTask } from '../types/task.type';

const tasksApi = createApi('/api/tasks');

export const createTask = async (columnId: string, task: TCreateTask) => {
  return await tasksApi.post<ITask>(columnId, task);
};

export const updateTask = async (taskId: string, task: TUpdateTask) => {
  return await tasksApi.put(`${taskId}`, task);
};

export const deleteTask = async (taskId: string) => {
  return await tasksApi.delete(`${taskId}`);
};

export const moveTask = async (
  taskId: string,
  columnId: string,
  position?: number
) => {
  return await tasksApi.patch(`${taskId}/move`, { columnId, position });
};
