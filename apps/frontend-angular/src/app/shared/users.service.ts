import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@kanban-board/shared';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  getUsers() {
    const url = '/api/users';
    return this.http.get<User[]>(url);
  }
}
