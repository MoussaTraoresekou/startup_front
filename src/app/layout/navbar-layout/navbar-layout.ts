import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-navbar-layout',
  standalone: true,
  // LES IMPORTS CRUCIAUX POUR VOTRE TEMPLATE HTML 🔌
  imports: [
    RouterLink,
    MatButtonModule,  // Pour mat-icon-button
    MatMenuModule,    // Pour mat-menu et matMenuTriggerFor
    MatDividerModule, // Pour mat-divider
    MatIconModule     // Pour mat-icon ou les spans material-icons
  ],
  templateUrl: './navbar-layout.html',
  styleUrls: ['./navbar-layout.css']
})
export class NavbarLayout {
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Action de déconnexion déclenchée par le bouton du menu déroulant
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
