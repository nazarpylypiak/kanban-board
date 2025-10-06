import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@kanban-board/shared';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private baseUrl = '/api/users';
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<User[]>(this.baseUrl);
  }
}
