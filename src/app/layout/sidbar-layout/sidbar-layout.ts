import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth-service';
import { NotificationSseService } from '../../core/services/notificationSpring/notification-sse-service';

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive, 
    MatIconModule
  ],
  templateUrl: './sidbar-layout.html',
  styleUrl: './sidbar-layout.css',
})
export class SidebarLayout implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  public sseService = inject(NotificationSseService);
  private router = inject(Router);

  roleConnecte: string | null = null;
  deconnexionEnCours = false;

  ngOnInit(): void {
    this.roleConnecte = this.authService.getRole();
    
    if (this.authService.estConnecte()) {
      const currentUserId = this.authService.getUtilisateurId();
      this.sseService.connecterAuFluxFlux(currentUserId);
    }
  }

  ngOnDestroy(): void {
    this.sseService.fermerConnexion();
  }

  public obtenirInitiales(): string {
    const prenom = this.authService.getPNom() || '';
    const nom = this.authService.getNom() || '';
    
    const initialePrenom = prenom.trim().charAt(0).toUpperCase();
    const initialeNom = nom.trim().charAt(0).toUpperCase();
    
    return `${initialePrenom}${initialeNom}` || 'U';
  }

  public obtenirRoleLabel(): string {
    const role = this.roleConnecte;
    if (role === 'ADMIN') return 'Administrateur';
    if (role === 'PORTEUR') return 'Porteur de Projet';
    if (role === 'MENTOR') return 'Mentor / Formateur';
    return role || 'Utilisateur';
  }

  public deconnexion(): void {
    this.deconnexionEnCours = true;
    this.sseService.fermerConnexion();
    
    setTimeout(() => {
      this.authService.logout();
      this.deconnexionEnCours = false;
      this.router.navigate(['/auth/login']);
    }, 350);
  }
}
