
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const roleAttendu = route.data['role'] as string | undefined;

  // 1. Vérifier la session.
  if (!auth.estConnecte()) {
    return router.createUrlTree(['/auth/login']);
  }

  // 2. Vérifier que la route définit un rôle.
  if (!roleAttendu) {
    return router.createUrlTree(['/']);
  }

  // 3. Vérifier les autorisations.
  if (auth.getRole() !== roleAttendu) {
    return router.createUrlTree(['/']);
  }

  return true;
};
