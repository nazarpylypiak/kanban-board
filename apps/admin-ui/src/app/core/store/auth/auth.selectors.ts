import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAccessToken = createSelector(
  selectAuthState,
  (state) => state.accessToken
);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.currentUser
);
