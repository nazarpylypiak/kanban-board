import { createAction, props } from '@ngrx/store';

export const setAccessToken = createAction(
  '[Auth] Set Access Token',
  props<{ token: string }>()
);

export const clearTokens = createAction('[Auth] Clear Tokens');
