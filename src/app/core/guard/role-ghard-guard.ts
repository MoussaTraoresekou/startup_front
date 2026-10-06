import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // 1. Récupération du rôle attendu configuré dans app.routes.ts (ex: 'PORTEUR')
  const roleAttendu = route.data['role'];

  // 2. Vérification immédiate et synchrone depuis votre AuthService
  if (auth.estConnecte() && auth.getRole() === roleAttendu) {
    return true; // Accès autorisé
  }

  // 3. Si l'utilisateur n'a pas le bon rôle, redirection automatique vers la page de dashboard par défaut
  router.navigate(['/me/dashboard']);
  return false;
};
