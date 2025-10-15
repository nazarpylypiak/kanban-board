import { createReducer, on } from '@ngrx/store';
import { TaskStats } from '../../../shared/services/analytics.service';
import { AnalyticsActions } from './analytics.actions';

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

export const analyticsReducer = createReducer(
  initialState,

  on(AnalyticsActions.loadBoardAnalytics, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AnalyticsActions.loadBoardAnalyticsSuccess, (state, { stats }) => ({
    ...state,
    loading: false,
    stats
  })),

  on(AnalyticsActions.loadBoardAnalyticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
