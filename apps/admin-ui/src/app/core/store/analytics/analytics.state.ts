import { TaskStats } from '@kanban-board/shared';

export interface AnalyticsState {
  stats: TaskStats | null;
  loading: boolean;
  error: any;
}

export const initialState: AnalyticsState = {
  stats: null,
  loading: false,
  error: null
};
