import { IColumn } from '@kanban-board/shared';
import { createApi } from '../../core/services/api';
import { TUpdateColumn } from '../types/column.type';

const columnsApi = createApi('/api/columns');

export const getAllColumns = async (boardId: string) => {
  return await columnsApi.get<IColumn[]>('', { params: { boardId } });
};

export const createColumn = async (boardId: string, name: string) => {
  return await columnsApi.post<IColumn>(boardId, { name });
};

export const updateColumn = async (id: string, body: TUpdateColumn) => {
  return await columnsApi.patch<IColumn>(id, body);
};
