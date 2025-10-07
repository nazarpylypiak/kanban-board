import { IColumn } from '@kanban-board/shared';
import { createApi } from '../../core/services/api';

const columnsApi = createApi('/api/columns');

export const getAll = async (boardId: string) => {
  return await columnsApi.get<IColumn[]>('', { params: { boardId } });
};

export const create = async (boardId: string, name: string) => {
  return await columnsApi.post<IColumn>(boardId, { name });
};
