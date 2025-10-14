// src/app/services/analytics.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface TaskStats {
  totalTasks: number;
  averageCompletionTime: number;
  tasksPerStatus: Record<string, number>;
  tasksPerUser: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);

  getBoardAnalytics(boardId: string): Observable<TaskStats> {
    return this.http.get<TaskStats>(`/api/analytics/boards/${boardId}`);
  }
}
