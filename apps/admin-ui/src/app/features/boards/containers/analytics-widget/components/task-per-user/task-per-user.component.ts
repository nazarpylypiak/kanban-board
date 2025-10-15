import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TTaskPer } from '@kanban-board/shared';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { IChartWidget } from '../../../../../../shared/containers/chart-widget/chart-widget.interface';
import { CHART_WIDGET } from '../../../../../../shared/containers/chart-widget/chart-widget.token';

@Component({
  selector: 'app-task-per-user',
  imports: [BaseChartDirective],
  templateUrl: './task-per-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CHART_WIDGET, useExisting: TaskPerUserComponent }]
})
export class TaskPerUserComponent implements IChartWidget {
  data = input<TTaskPer | null | undefined>();
  chartData: ChartData<'pie'> = { labels: [], datasets: [] };

  loaded(tasksPerUser: TTaskPer) {
    this.chartData = {
      labels: Object.keys(tasksPerUser),
      datasets: [
        {
          data: Object.values(tasksPerUser),
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
