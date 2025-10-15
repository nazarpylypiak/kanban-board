import { IUser } from '@kanban-board/shared';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

const selectAuthUser = (state: RootState): IUser | null => state.auth.user;

export const selectIsAdmin = createSelector(
  [selectAuthUser],
  (user) => user?.role === 'admin'
);
