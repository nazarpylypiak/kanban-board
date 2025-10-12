import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IUser } from '@kanban-board/shared';
import { Observable } from 'rxjs';
import { UserApiService } from '../../../../shared/services/api/user-api.service';

@Component({
  selector: 'app-user-list',
  imports: [AsyncPipe],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  private readonly userApiService = inject(UserApiService);
  users$: Observable<IUser[]> = this.userApiService.getAll();
}
