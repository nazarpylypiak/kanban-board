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
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AnalyticsEffects } from './core/store/analytics/analytics.effects';
import { analyticsReducer } from './core/store/analytics/analytics.reducer';
import { AuthEffects } from './core/store/auth/auth.effects';
import { authReducer } from './core/store/auth/auth.reducer';
import { BoardsEffects } from './core/store/boards/boards.effects';
import { boardsReducer } from './core/store/boards/boards.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({
      auth: authReducer,
      boards: boardsReducer,
      analytics: analyticsReducer
    }),
    provideEffects([BoardsEffects, AnalyticsEffects, AuthEffects]),
    provideStoreDevtools({ maxAge: 25 }),
    provideCharts(withDefaultRegisterables())
  ]
};
