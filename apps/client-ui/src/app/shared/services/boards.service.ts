import { IBoard, IUser } from '@kanban-board/shared';
import { createApi } from '../../core/services/api';
import { ICreateBoard, IUpdateBoard } from '../types/board.interface';

const boardsApi = createApi('/api/boards');

export const getMyBoards = async () => {
  return await boardsApi.get<IBoard[]>('my-boards');
};

export const getAll = async (ownerId: string) => {
  return await boardsApi.get<IBoard[]>('', { params: { ownerId } });
};

export const getOne = (id: string) => {
  return boardsApi.get(id);
};

export const getBoardUsers = async (boardId: string) => {
  return await boardsApi.get<IUser[]>(`${boardId}/users`);
};

export const createBoard = async (board: ICreateBoard) => {
  const newBoard = await boardsApi.post<IBoard>('', board);
  return newBoard.data;
};

export const updateBoard = async (id: string, board: IUpdateBoard) => {
  const newBoard = await boardsApi.put<IBoard>(id, board);
  return newBoard.data;
};

export const deleteBoard = async (id: string) => {
  const res = await boardsApi.delete(id);
  return res.data;
};

export const shareBoard = (boardId: string, userIds: string[]) => {
  return boardsApi.patch(`${boardId}/share`, { userIds });
};
