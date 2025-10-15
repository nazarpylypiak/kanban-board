import { InputSignal } from '@angular/core';
import { TTaskPer } from '@kanban-board/shared';

export interface IChartWidget {
  data: InputSignal<TTaskPer | null | undefined>;
  loaded: (data: TTaskPer) => void;
}
