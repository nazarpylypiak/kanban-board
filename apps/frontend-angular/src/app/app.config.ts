import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authReducer } from './core/store/auth/auth.reducer';
import { BoardsEffects } from './core/store/boards/boards.effects';
import { boardsReducer } from './core/store/boards/boards.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({ auth: authReducer, boards: boardsReducer }),
    provideEffects([BoardsEffects]),
    provideStoreDevtools({ maxAge: 25 })
  ]
};
