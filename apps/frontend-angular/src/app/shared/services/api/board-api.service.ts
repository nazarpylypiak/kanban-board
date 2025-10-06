import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IBoard } from '@kanban-board/shared';

@Injectable({
  providedIn: 'root'
})
export class BoardApiService {
  private readonly baseUrl = '/api/boards';
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<IBoard[]>(this.baseUrl);
  }

  getOne(id: string) {
    return this.http.get<IBoard>(`${this.baseUrl}/${id}`);
  }

  create(name: string) {
    return this.http.post<IBoard>(this.baseUrl, { name });
  }

  update(id: string, name: string) {
    return this.http.put<IBoard>(`${this.baseUrl}/${id}`, { name });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
