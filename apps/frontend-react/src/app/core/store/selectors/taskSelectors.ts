import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

export const selectTasksByColumn = (columnId: string) =>
  createSelector(
    (state: RootState) => state.tasks.data,
    (tasks) =>
      tasks
        .filter((t) => t.columnId === columnId)
        .sort((a, b) => a.position - b.position)
  );

const selectAllTasks = (state: RootState) => state.tasks.data;

export const makeSelectTasksByColumn = (columnId: string) =>
  createSelector([selectAllTasks], (allTasks) =>
    allTasks
      .filter((t) => t.columnId === columnId)
      .sort((a, b) => a.position - b.position)
  );
