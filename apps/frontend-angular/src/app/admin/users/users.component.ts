import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { User } from '@kanban-board/shared';
import { Observable } from 'rxjs';
import { UsersService } from '../../shared/users.service';

@Component({
  selector: 'app-users',
  imports: [AsyncPipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  private readonly usersService = inject(UsersService);
  users$: Observable<User[]> = this.usersService.getUsers();
}
