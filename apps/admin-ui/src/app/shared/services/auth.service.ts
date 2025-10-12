import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, map, Observable, of } from 'rxjs';
import {
  clearTokens,
  setAccessToken
} from '../../core/store/auth/auth.actions';
import { AppState } from '../../core/store/auth/auth.state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(Store<AppState>);

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  refreshToken(): Observable<string | null> {
    return this.http.get<{ accessToken: string }>('/api/auth/refresh').pipe(
      map((res) => {
        this.store.dispatch(setAccessToken({ token: res.accessToken }));
        return res.accessToken;
      }),
      catchError(() => {
        this.store.dispatch(clearTokens());
        return of(null);
      })
    );
  }

  clearTokens() {
    this.store.dispatch(clearTokens());
  }
}
