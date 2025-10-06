import { IBoard } from '@kanban-board/shared';
import { createApi } from '../../core/services/api';
import { ICreateBoard, IUpdateBoard } from '../interfaces/board.interface';

const boardsApi = createApi('/api/boards');

export const getAll = async (ownerId: string) => {
  return await boardsApi.get<IBoard[]>('', { params: { ownerId } });
};

export const getOne = (id: string) => {
  return boardsApi.get(id);
};

export const create = async (board: ICreateBoard) => {
  const newBoard = await boardsApi.post<IBoard>('', board);
  return newBoard.data;
};

export const update = async (id: string, board: IUpdateBoard) => {
  const newBoard = await boardsApi.put<IBoard>(id, board);
  return newBoard.data;
};
