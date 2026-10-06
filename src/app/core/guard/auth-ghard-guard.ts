import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. On demande à l'AuthService si un token JWT est présent dans le localStorage
  if (auth.estConnecte()) {
    return true; // L'utilisateur est connecté, il passe ce premier barrage !
  }

  // 2. Si aucun token n'est trouvé, redirection immédiate vers l'écran de login
  router.navigate(['/login']);
  return false;
};
