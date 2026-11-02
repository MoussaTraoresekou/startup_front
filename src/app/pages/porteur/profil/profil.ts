import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profil',
  imports: [MatIconModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil {

  private authService = inject(AuthService);

  nomComplet = this.authService.getNomComplet();
  nom = this.authService.getNom();
  prenom = this.authService.getPNom();
  email = this.authService.getEmail();
  role = this.authService.getRole();
  userId = this.authService.getUserId();

  get roleLibelle(): string {
    switch (this.role) {
      case 'ADMIN':
        return 'Administrateur';

      case 'PORTEUR':
        return 'Porteur de projet';

      case 'MENTOR':
        return 'Mentor';

      case 'INVESTISSEUR':
        return 'Investisseur';

      case 'COLLABORATEUR':
        return 'Collaborateur';

      default:
        return 'Utilisateur';
    }
  }

  get initiales(): string {
    const prenom = this.prenom?.trim() ?? '';
    const nom = this.nom?.trim() ?? '';

    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || 'U';
  }

}