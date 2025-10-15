import { createActionGroup, props } from '@ngrx/store';
import { TaskStats } from '../../../shared/services/analytics.service';

export const AnalyticsActions = createActionGroup({
  source: 'Analytics',
  events: {
    'Load Board Analytics': props<{ boardId: string }>(),
    'Load Board Analytics Success': props<{ stats: TaskStats }>(),
    'Load Board Analytics Failure': props<{ error: any }>()
  }
});
