import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '@kanban-board/shared';
import { Store } from '@ngrx/store';
import { filter, map, Observable } from 'rxjs';
import { AnalyticsActions } from '../../../core/store/analytics/analytics.actions';
import { selectCurrentUser } from '../../../core/store/auth/auth.selectors';
import { SocketService } from '../../../shared/services/socket.service';
import { AnalyticsWidgetComponent } from '../containers/analytics-widget/analytics-widget.component';

@Component({
  selector: 'app-analytics-page',
  imports: [AnalyticsWidgetComponent, AsyncPipe],
  template: `
    <app-analytics-widget
      [currentUserId]="currentUserId$ | async"
      [boardId]="boardId"
    ></app-analytics-widget>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private socketService = inject(SocketService);
  private store = inject(Store);

  boardId!: string;
  currentUserId$: Observable<string | null> = this.store
    .select(selectCurrentUser)
    .pipe(
      filter((u): u is IUser => !!u),
      map(({ id }) => id),
      takeUntilDestroyed()
    );

  constructor() {
    this.socketService
      .onNotification()
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.store.dispatch(
          AnalyticsActions.loadBoardAnalytics({ boardId: this.boardId })
        );
      });
  }

  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('boardId') ?? '';
  }
}
