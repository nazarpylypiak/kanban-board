import { Routes } from '@angular/router';
import { adminGuard } from '../core/guards/admin.guard';
import { AdminComponent } from './admin.component';
import { UsersComponent } from './users/users.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },
];
