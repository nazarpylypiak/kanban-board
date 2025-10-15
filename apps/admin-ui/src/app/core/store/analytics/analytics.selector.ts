import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AnalyticsState } from './analytics.state';

export const selectAnalyticsState =
  createFeatureSelector<AnalyticsState>('analytics');

export const selectAnalyticsStats = createSelector(
  selectAnalyticsState,
  (state) => state.stats
);

export const selectAnalyticsLoading = createSelector(
  selectAnalyticsState,
  (state) => state.loading
);

export const selectAnalyticsError = createSelector(
  selectAnalyticsState,
  (state) => state.error
);
