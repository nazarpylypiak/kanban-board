import { IBoard } from '@kanban-board/shared';
import { createAction, props } from '@ngrx/store';

export const loadBoards = createAction('[Boards] Load Boards');
export const loadBoardsSuccess = createAction(
  '[Boards] Load Boards Success',
  props<{ boards: IBoard[] }>()
);
export const loadBoardsFailure = createAction(
  '[Boards] Load Boards Failure',
  props<{ error: any }>()
);

export const createBoard = createAction(
  '[Boards] Create Board',
  props<{ name: string }>()
);
export const createBoardSuccess = createAction(
  '[Boards] Create Board Success',
  props<{ board: IBoard }>()
);
export const createBoardFailure = createAction(
  '[Boards] Create Board Failure',
  props<{ error: any }>()
);

export const updateBoard = createAction(
  '[Boards] Update Board',
  props<{ board: IBoard }>()
);
export const updateBoardSuccess = createAction(
  '[Boards] Update Board Success',
  props<{ board: IBoard }>()
);
export const updateBoardFailure = createAction(
  '[Boards] Update Board Failure',
  props<{ error: any }>()
);

export const deleteBoard = createAction(
  '[Boards] Delete Board',
  props<{ id: string }>()
);
export const deleteBoardSuccess = createAction(
  '[Boards] Delete Board Success',
  props<{ id: string }>()
);
export const deleteBoardFailure = createAction(
  '[Boards] Delete Board Failure',
  props<{ error: any }>()
);
