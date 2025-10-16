import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';
import { UserApiService } from '../../shared/services/api/user-api.service';
import { AuthService } from '../../shared/services/auth.service';
import { selectAccessToken } from '../store/auth/auth.selectors';

export const adminGuard: CanActivateFn = () => {
  const store = inject(Store);
  const auth = inject(AuthService);
  const userApi = inject(UserApiService);
  const router = inject(Router);

  return store.select(selectAccessToken).pipe(
    switchMap((token) => {
      // 1️⃣ Token exists and valid → decode role
      if (token && !auth.isTokenExpired(token)) {
        const role = auth.getUserRoleFromToken(token);
        if (role === 'admin') return of(true);

        router.navigate(['/unauthorized']);
        return of(false);
      }

      // 2️⃣ Token missing or expired → refresh token
      return auth.refreshToken().pipe(
        switchMap((newToken) => {
          if (!newToken) {
            router.navigate(['/login']);
            return of(false);
          }

          // 3️⃣ Try decode role from refreshed token
          const role = auth.getUserRoleFromToken(newToken);
          if (role === 'admin') return of(true);

          // 4️⃣ Fallback: fetch profile from backend
          return userApi.getProfile().pipe(
            map((profile) => {
              if (profile.role === 'admin') return true;

              router.navigate(['/unauthorized']);
              return false;
            }),
            catchError(() => {
              router.navigate(['/login']);
              return of(false);
            })
          );
        }),
        catchError(() => {
          router.navigate(['/login']);
          return of(false);
        })
      );
    })
  );
};
