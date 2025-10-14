import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsWidgetComponent } from './analytics-widget/analytics-widget.component';

@Component({
  selector: 'app-analytics-page',
  imports: [AnalyticsWidgetComponent],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsPageComponent implements OnInit {
  boardId!: string;

  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('boardId')!;
  }
}
