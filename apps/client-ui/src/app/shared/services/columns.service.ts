import { IColumn } from '@kanban-board/shared';
import { createApi } from '../../core/services/api';
import { TCreateColumn, TUpdateColumn } from '../types/column.type';

const columnsApi = createApi('/api');

export const getAllColumns = async () => {
  return await columnsApi.get<IColumn[]>('columns');
};

export const getBoardColumns = (boardId: string) => {
  return columnsApi.get<IColumn[]>(`boards/${boardId}/columns`);
};

export const createColumn = async (boardId: string, body: TCreateColumn) => {
  return await columnsApi.post<IColumn>(`boards/${boardId}/columns`, body);
};

export const updateColumn = async (id: string, body: TUpdateColumn) => {
  return await columnsApi.patch<IColumn>(`columns/${id}`, body);
};
