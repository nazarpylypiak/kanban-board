import { Action, combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './auth/authSlice';
import { boardsReducer } from './boards/boardsSlice';
import { columnsReducer } from './columns/columnsSlice';
import { tasksReducer } from './tasks';
import { usersReducer } from './users/usersSlice';

const appReducer = combineReducers({
  auth: authReducer,
  boards: boardsReducer,
  columns: columnsReducer,
  tasks: tasksReducer,
  users: usersReducer
});

export const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: Action
) => {
  if (action.type === 'auth/clearAuth') {
    state = undefined;
  }
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof appReducer>;
