
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule
  ],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css'
})
export class PageNotFound {

  private readonly authService = inject(AuthService);

  readonly routeRetour = this.obtenirRouteRetour();

  private obtenirRouteRetour(): string {

    // Vérifier la validité de la session.
    if (!this.authService.estConnecte()) {
      return '/auth/login';
    }

    const role = this.authService.getRole();

    switch (role) {

      case 'ADMIN':
        return '/admin/dashboard';

      case 'PORTEUR':
        return '/porteur/mes-projets';

      case 'MENTOR':
        return '/mentor/dashboard';

      case 'INVESTISSEUR':
        return '/investisseur/dashboard';

      case 'COLLABORATEUR':
        return '/collaborateur/dashboard';

      default:
        return '/auth/login';
    }
  }
}
