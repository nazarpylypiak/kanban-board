import { createReducer, on } from '@ngrx/store';
import { AnalyticsActions } from './analytics.actions';
import { initialState } from './analytics.state';

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
