import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

export const selectTasksByColumn = (columnId: string) =>
  createSelector(
    (state: RootState) => state.tasks.data,
    (tasks) => tasks.filter((t) => t.columnId === columnId)
  );
