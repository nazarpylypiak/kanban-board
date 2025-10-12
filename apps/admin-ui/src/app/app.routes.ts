import { Route } from '@angular/router';
import { adminRoutes } from './layout/admin-layout/admin.routes';

export const appRoutes: Route[] = [
  ...adminRoutes,
  {
    path: '',
    redirectTo: '/admin',
    pathMatch: 'full',
  },
];
