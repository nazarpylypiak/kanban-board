import { AnalyticsState } from './analytics/analytics.state';
import { AuthState } from './auth/auth.state';
import { BoardsState } from './boards/boards.state';

export interface AppState {
  auth: AuthState;
  boards: BoardsState;
  analytics: AnalyticsState;
}
