import { IBoard } from '@kanban-board/shared';
import { createApi } from './api';

const boardsApi = createApi('/api/boards');

export const getAll = async (ownerId: string) => {
  return await boardsApi.get<IBoard[]>('', { params: { ownerId } });
};
