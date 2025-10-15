import { inject } from '@angular/core';
import { Injectable } from '@nestjs/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { UserApiService } from '../../../shared/services/api/user-api.service';
import AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions = inject(Actions);
  private userApiService = inject(UserApiService);

  loadCurrentUser$ = createEffect(() =>
    this.actions.pipe(
      ofType(AuthActions.fetchCurrentUser),
      mergeMap(() =>
        this.userApiService.getProfile().pipe(
          map((currentUser) =>
            AuthActions.fetchCurrentUserSuccessfully({ currentUser })
          ),
          catchError((error) =>
            of(AuthActions.fetchCurrentUserFailure({ error }))
          )
        )
      )
    )
  );
}
