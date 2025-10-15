import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TTaskPer } from '@kanban-board/shared';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { IChartWidget } from '../../../../../../shared/containers/chart-widget/chart-widget.interface';
import { CHART_WIDGET } from '../../../../../../shared/containers/chart-widget/chart-widget.token';

@Component({
  selector: 'app-task-per-status',
  imports: [BaseChartDirective],
  templateUrl: './task-per-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CHART_WIDGET, useExisting: TaskPerStatusComponent }]
})
export class TaskPerStatusComponent implements IChartWidget {
  data = input<TTaskPer | null | undefined>();
  chartData: ChartData<'bar'> = { labels: [], datasets: [] };

  loaded(tasksPerStatus: TTaskPer) {
    this.chartData = {
      labels: Object.keys(tasksPerStatus),
      datasets: [
        {
          data: Object.values(tasksPerStatus),
          label: 'Tasks per Status',
          backgroundColor: ['#3f51b5', '#ff9800', '#4caf50', '#f44336']
        }
      ]
    };
  }
}
