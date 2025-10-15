import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsWidgetComponent } from './analytics-widget/analytics-widget.component';

@Component({
  selector: 'app-analytics-page',
  imports: [AnalyticsWidgetComponent],
  template: `
    <app-analytics-widget [boardId]="boardId"></app-analytics-widget>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsPageComponent implements OnInit {
  boardId!: string;

  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('boardId') ?? '';
  }
}
