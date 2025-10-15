import { TaskStats } from '@kanban-board/shared';
import { createActionGroup, props } from '@ngrx/store';

export const AnalyticsActions = createActionGroup({
  source: 'Analytics',
  events: {
    'Load Board Analytics': props<{ boardId: string }>(),
    'Load Board Analytics Success': props<{ stats: TaskStats }>(),
    'Load Board Analytics Failure': props<{ error: any }>()
  }
});
