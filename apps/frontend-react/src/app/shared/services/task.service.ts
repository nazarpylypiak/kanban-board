import { ITask } from '@kanban-board/shared';
import { createApi } from '../../core/services/api';

const tasksApi = createApi('/api/tasks');

export const create = async (
  columnId: string,
  task: Omit<ITask, 'columnId'>
) => {
  return await tasksApi.post<ITask>(columnId, task);
};

export const moveTask = async (taskId: string, newColumnId: string) => {
  return await tasksApi.patch(`${taskId}/move/${newColumnId}`);
};
