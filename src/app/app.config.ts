import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
     // ENREGISTREMENT DE L'INTERCEPTOR ICI 🔌
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),
    provideRouter(routes)
  ]
};
