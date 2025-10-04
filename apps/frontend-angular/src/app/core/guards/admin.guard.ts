import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../shared/auth.service';
import { selectAccessToken } from '../store/auth.selectors';

export const adminGuard: CanActivateFn = async () => {
  const store = inject(Store);
  const auth = inject(AuthService);

  const token = await firstValueFrom(store.select(selectAccessToken));

  if (!token || auth.isTokenExpired(token)) {
    const newToken = await firstValueFrom(auth.refreshToken());
    if (!newToken) {
      window.location.href = 'http://localhost:4300/login';
      return false;
    }
  }

  return true;
};
