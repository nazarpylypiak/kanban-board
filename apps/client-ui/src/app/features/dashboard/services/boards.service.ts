import { IBoard, IUser } from '@kanban-board/shared';
import { createApi } from '../../../core/services/api';
import {
  ICreateBoard,
  IUpdateBoard
} from '../../../shared/types/board.interface';

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
  return boardsApi.post<IBoard>('', board);
};

export const updateBoard = async (id: string, board: IUpdateBoard) => {
  const newBoard = await boardsApi.put<IBoard>(id, board);
  return newBoard.data;
};

export const deleteBoard = (id: string) => {
  return boardsApi.delete(id);
};

export const shareBoard = (boardId: string, userIds: string[]) => {
  return boardsApi.patch(`${boardId}/share`, { userIds });
};
