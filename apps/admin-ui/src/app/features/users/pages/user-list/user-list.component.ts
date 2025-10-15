import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { IUser } from '@kanban-board/shared';
import { UserApiService } from '../../../../shared/services/api/user-api.service';

@Component({
  selector: 'app-user-list',
  imports: [AsyncPipe, MatTableModule, MatIconModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent {
  private readonly userApiService = inject(UserApiService);
  users$ = this.userApiService.getAll();

  displayedColumns: string[] = ['id', 'email', 'role', 'actions'];

  addUser() {
    // open add user dialog
  }

  editUser(user: IUser) {
    // open edit user dialog
  }

  deleteUser(id: string) {
    // delete user logic
  }
}
