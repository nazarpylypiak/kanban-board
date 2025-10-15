import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  effect,
  input
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { IChartWidget } from './chart-widget.interface';
import { CHART_WIDGET } from './chart-widget.token';

@Component({
  selector: 'app-chart-widget',
  imports: [MatCardModule],
  templateUrl: './chart-widget.component.html',
  styleUrl: './chart-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartWidgetComponent {
  title = input('');

  @ContentChild(CHART_WIDGET, { static: true }) contentContainer!: IChartWidget;

  constructor() {
    effect(() => {
      const data = this.contentContainer.data();
      if (!data) return;
      this.contentContainer.loaded(data);
    });
  }
}
