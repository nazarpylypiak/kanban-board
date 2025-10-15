import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { AnalyticsPageComponent } from '../../features/boards/pages/analytics-page.component';
import { BoardListComponent } from '../../features/boards/pages/board-list/board-list.component';
import { UserListComponent } from '../../features/users/pages/user-list/user-list.component';
import { LayoutComponent } from './admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'analytics/:boardId', component: AnalyticsPageComponent },
      { path: 'boards', component: BoardListComponent },
      { path: 'users', component: UserListComponent },
      { path: '', redirectTo: 'boards', pathMatch: 'full' }
    ]
  }
];
