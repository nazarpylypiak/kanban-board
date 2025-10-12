import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BoardsState } from './boards.state';

export const selectBoardsFeature = createFeatureSelector<BoardsState>('boards');

export const selectAllBoards = createSelector(
  selectBoardsFeature,
  (state) => state.boards
);

export const selectBoardsLoading = createSelector(
  selectBoardsFeature,
  (state) => state.loading
);
