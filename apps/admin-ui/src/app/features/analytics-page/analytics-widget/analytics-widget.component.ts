import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { Store } from '@ngrx/store';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { filter, tap } from 'rxjs';
import { AnalyticsActions } from '../../../core/store/analytics/analytics.actions';
import {
  selectAnalyticsLoading,
  selectAnalyticsStats
} from '../../../core/store/analytics/analytics.selector';
import { TaskStats } from '../../../shared/services/analytics.service';

@Component({
  selector: 'app-analytics-widget',
  templateUrl: './analytics-widget.component.html',
  styleUrls: ['./analytics-widget.component.scss'],
  imports: [MatCardModule, CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsWidgetComponent implements OnInit {
  @Input() boardId!: string;

  private store = inject(Store);

  stats$ = this.store.select(selectAnalyticsStats);
  loading$ = this.store.select(selectAnalyticsLoading);
  stats?: TaskStats;

  destroyRef = inject(DestroyRef);

  // Charts
  statusChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  userChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  ngOnInit(): void {
    if (this.boardId) {
      this.store.dispatch(
        AnalyticsActions.loadBoardAnalytics({ boardId: this.boardId })
      );

      this.stats$ = this.store.select(selectAnalyticsStats).pipe(
        filter((stats): stats is TaskStats => !!stats),
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.updateCharts(res);
        })
      );
    }
  }

  private updateCharts(stats: TaskStats) {
    // Tasks per status chart
    this.statusChartData = {
      labels: Object.keys(stats.tasksPerStatus),
      datasets: [
        {
          data: Object.values(stats.tasksPerStatus),
          label: 'Tasks per Status',
          backgroundColor: ['#3f51b5', '#ff9800', '#4caf50', '#f44336']
        }
      ]
    };

    // Tasks per user chart
    this.userChartData = {
      labels: Object.keys(stats.tasksPerUser),
      datasets: [
        {
          data: Object.values(stats.tasksPerUser),
          backgroundColor: [
            '#2196f3',
            '#e91e63',
            '#ffeb3b',
            '#9c27b0',
            '#4caf50',
            '#ff9800'
          ]
        }
      ]
    };
  }
}
