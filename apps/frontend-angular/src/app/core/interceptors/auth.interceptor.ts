import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, firstValueFrom } from 'rxjs';
import { selectAccessToken } from '../store/auth.selectors';
import { AppState } from '../store/auth.state';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const store = inject(Store<AppState>);

  return new Observable((observer) => {
    firstValueFrom(store.select(selectAccessToken)).then((token) => {
      let authReq = req;

      if (token) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // у HttpInterceptorFn замість next.handle(req) викликаємо просто next(authReq)
      next(authReq).subscribe({
        next: (res) => observer.next(res),
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
    });
  });
};
