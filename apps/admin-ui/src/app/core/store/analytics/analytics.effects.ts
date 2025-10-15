import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { AnalyticsActions } from './analytics.actions';

@Injectable()
export class AnalyticsEffects {
  private actions$ = inject(Actions);
  private analyticsService = inject(AnalyticsService);

  loadBoardAnalytics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AnalyticsActions.loadBoardAnalytics),
      mergeMap(({ boardId }) =>
        this.analyticsService.getBoardAnalytics(boardId).pipe(
          map((stats) => AnalyticsActions.loadBoardAnalyticsSuccess({ stats })),
          catchError((error) =>
            of(AnalyticsActions.loadBoardAnalyticsFailure({ error }))
          )
        )
      )
    )
  );
}
