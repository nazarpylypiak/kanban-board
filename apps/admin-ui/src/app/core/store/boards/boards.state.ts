import { IBoard } from '@kanban-board/shared';

export interface BoardsState {
  boards: IBoard[];
  loading: boolean;
  error?: any;
}

export const initialBoardsState: BoardsState = {
  boards: [],
  loading: false,
  error: null
};
