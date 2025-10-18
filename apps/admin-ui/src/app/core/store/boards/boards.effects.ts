import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { BoardApiService } from '../../../shared/services/api/board-api.service';
import * as BoardsActions from './boards.actions';

@Injectable()
export class BoardsEffects {
  private actions$ = inject(Actions);
  private boardsApiService = inject(BoardApiService);

  loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardsActions.loadBoards),
      mergeMap(() =>
        this.boardsApiService.getAll().pipe(
          map((boards) => BoardsActions.loadBoardsSuccess({ boards })),
          catchError((error) => of(BoardsActions.loadBoardsFailure({ error })))
        )
      )
    )
  );

  createBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardsActions.createBoard),
      mergeMap(({ name }) =>
        this.boardsApiService.create(name).pipe(
          map((board) => BoardsActions.createBoardSuccess({ board })),
          catchError((error) => of(BoardsActions.createBoardFailure({ error })))
        )
      )
    )
  );

  updateBoarda$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardsActions.updateBoard),
      mergeMap(({ board }) =>
        this.boardsApiService.update(board.id, board.name).pipe(
          map(() => BoardsActions.updateBoardSuccess({ board })),
          catchError((error) => of(BoardsActions.updateBoardFailure({ error })))
        )
      )
    )
  );

  deleteBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardsActions.deleteBoard),
      mergeMap(({ id }) =>
        this.boardsApiService.delete(id).pipe(
          map(() => BoardsActions.deleteBoardSuccess({ id })),
          catchError((error) => of(BoardsActions.deleteBoardFailure({ error })))
        )
      )
    )
  );
}
