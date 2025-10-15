import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TaskStats } from '@kanban-board/shared';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);

  getBoardAnalytics(boardId: string): Observable<TaskStats> {
    return this.http.get<TaskStats>(`/api/analytics/boards/${boardId}`);
  }
}
