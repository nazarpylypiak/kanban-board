import { createReducer, on } from '@ngrx/store';
import AuthActions from './auth.actions';
import { initialState } from './auth.state';

export const authReducer = createReducer(
  initialState,
  on(AuthActions.setAccessToken, (state, { token }) => ({
    ...state,
    accessToken: token
  })),
  on(AuthActions.clearTokens, () => ({ ...initialState, accessToken: null })),
  on(AuthActions.setCurrentUser, (state, { currentUser }) => ({
    ...state,
    currentUser
  })),
  on(AuthActions.clearCurrentUser, () => ({
    ...initialState,
    currentUser: null
  })),
  on(AuthActions.fetchCurrentUserSuccessfully, (state, { currentUser }) => ({
    ...state,
    currentUser
  }))
);
