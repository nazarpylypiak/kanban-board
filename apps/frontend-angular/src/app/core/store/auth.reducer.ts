import { createReducer, on } from '@ngrx/store';
import { clearTokens, setAccessToken } from './auth.actions';

export interface AuthState {
  accessToken: string | null;
}

export const initialState: AuthState = {
  accessToken: null,
};

export const authReducer = createReducer(
  initialState,
  on(setAccessToken, (state, { token }) => ({ ...state, accessToken: token })),
  on(clearTokens, () => initialState)
);
