import { createReducer, on } from '@ngrx/store';
import * as BoardsActions from './boards.actions';
import { initialBoardsState } from './boards.state';

export const boardsReducer = createReducer(
  initialBoardsState,

  on(BoardsActions.loadBoards, (state) => ({ ...state, loading: true })),
  on(BoardsActions.loadBoardsSuccess, (state, { boards }) => ({
    ...state,
    boards,
    loading: false
  })),
  on(BoardsActions.loadBoardsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(BoardsActions.createBoardSuccess, (state, { board }) => ({
    ...state,
    boards: [...state.boards, board],
    loading: false
  })),
  on(BoardsActions.createBoardFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  on(BoardsActions.updateBoard, (state) => ({ ...state, loading: true })),
  on(BoardsActions.updateBoardSuccess, (state, { board }) => ({
    ...state,
    boards: state.boards.map((b) => (b.id === board.id ? board : b))
  })),
  on(BoardsActions.updateBoardFailure, (state, { error }) => ({
    ...state,
    error
  })),

  on(BoardsActions.deleteBoard, (state) => ({ ...state, loading: true })),
  on(BoardsActions.deleteBoardSuccess, (state, { id }) => ({
    ...state,
    boards: state.boards.filter((board) => board.id !== id)
  })),
  on(BoardsActions.deleteBoardFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
