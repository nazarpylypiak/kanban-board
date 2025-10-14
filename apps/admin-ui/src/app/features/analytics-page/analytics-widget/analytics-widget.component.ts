import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  AnalyticsService,
  TaskStats
} from '../../../shared/services/analytics.service';

@Component({
  selector: 'app-analytics-widget',
  templateUrl: './analytics-widget.component.html',
  styleUrls: ['./analytics-widget.component.scss'],
  imports: [MatCardModule, CommonModule, BaseChartDirective]
})
export class AnalyticsWidgetComponent implements OnChanges {
  @Input() boardId!: string;

  private analyticsService = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);
  stats?: TaskStats;

  // Charts
  statusChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  userChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  ngOnChanges(): void {
    if (this.boardId) {
      this.analyticsService
        .getBoardAnalytics(this.boardId)
        .subscribe((stats) => {
          this.stats = stats;
          this.updateCharts(stats);
          this.cdr.markForCheck();
        });
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
