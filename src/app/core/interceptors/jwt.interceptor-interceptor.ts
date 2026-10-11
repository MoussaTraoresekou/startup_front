
import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth-service';
import { NotificationService } from '../services/notification-service';

let expirationEnCours = false;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  const token = localStorage.getItem('token');

  const requete = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(requete).pipe(
    catchError((error: HttpErrorResponse) => {
      const estRequeteLogin = req.url.includes('/api/user/login');

      if (error.status === 401 && !estRequeteLogin) {
        const sessionExistante = !!localStorage.getItem('token');

        if (sessionExistante && !expirationEnCours) {
          expirationEnCours = true;

          authService.logout();

          notification.erreur(
            'Votre session a expiré. Veuillez vous reconnecter.'
          );

          if (router.url !== '/auth/login') {
            void router.navigate(['/auth/login']).finally(() => {
              expirationEnCours = false;
            });
          } else {
            expirationEnCours = false;
          }
        } else if (!sessionExistante && router.url !== '/auth/login') {
          void router.navigate(['/auth/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
