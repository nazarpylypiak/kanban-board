import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input
} from '@angular/core';
import { TaskStats } from '@kanban-board/shared';
import { Store } from '@ngrx/store';
import { ChartData } from 'chart.js';
import { map } from 'rxjs';
import { AnalyticsActions } from '../../../../core/store/analytics/analytics.actions';
import {
  selectAnalyticsLoading,
  selectAnalyticsState,
  selectAnalyticsStats
} from '../../../../core/store/analytics/analytics.selector';
import { ChartWidgetComponent } from '../../../../shared/containers/chart-widget/chart-widget.component';
import { SocketService } from '../../../../shared/services/socket.service';
import { SummaryCardComponent } from './components/summary-card/summary-card.component';
import { TaskPerStatusComponent } from './components/task-per-status/task-per-status.component';
import { TaskPerUserComponent } from './components/task-per-user/task-per-user.component';

@Component({
  selector: 'app-analytics-widget',
  templateUrl: './analytics-widget.component.html',
  imports: [
    CommonModule,
    SummaryCardComponent,
    ChartWidgetComponent,
    TaskPerStatusComponent,
    TaskPerUserComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsWidgetComponent {
  boardId = input.required<string>();
  currentUserId = input<string | null>('');

  private store = inject(Store);

  stats$ = this.store.select(selectAnalyticsStats);
  loading$ = this.store.select(selectAnalyticsLoading);
  stats?: TaskStats;
  private socketService = inject(SocketService);
  destroyRef = inject(DestroyRef);

  // Charts
  statusChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  userChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  vm$ = this.store.select(selectAnalyticsState).pipe(
    map((state) => ({
      loading: state.loading,
      data: state.stats,
      error: state.error
    }))
  );

  constructor() {
    effect(() => {
      const adminId = this.currentUserId();
      if (!adminId) return;
      this.socketService.joinAdminRoom(adminId);
    });

    effect(() => {
      const id = this.boardId();
      if (id) {
        this.store.dispatch(
          AnalyticsActions.loadBoardAnalytics({ boardId: id })
        );
      }
    });
  }
}
