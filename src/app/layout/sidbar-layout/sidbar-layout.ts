import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth-service';

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
export class SidebarLayout implements OnInit {
  // Injection moderne de vos services
  public authService = inject(AuthService);
  private router = inject(Router);

  roleConnecte: string | null = null;
  deconnexionEnCours = false;

  ngOnInit(): void {
    // Lecture directe du rôle stocké en cache lors du Login
    this.roleConnecte = this.authService.getRole();
  }

  /**
   * Calcule les deux premières lettres du profil utilisateur (ex: "Moussa Traoré" -> "MT")
   */
  public obtenirInitiales(): string {
    const prenom = this.authService.getPNom() || '';
    const nom = this.authService.getNom() || '';
    
    const initialePrenom = prenom.trim().charAt(0).toUpperCase();
    const initialeNom = nom.trim().charAt(0).toUpperCase();
    
    return `${initialePrenom}${initialeNom}` || 'U';
  }

  /**
   * Traduit le rôle technique de la base de données pour un affichage propre
   */
  public obtenirRoleLabel(): string {
    const role = this.roleConnecte;
    if (role === 'ADMIN') return 'Administrateur';
    if (role === 'PORTEUR') return 'Porteur de Projet';
    if (role === 'MENTOR') return 'Mentor / Formateur';
    return role || 'Utilisateur';
  }

  /**
   * Efface le localStorage et redirige l'utilisateur vers la mire de connexion
   */
  public deconnexion(): void {
    this.deconnexionEnCours = true;
    
    // Petite temporisation visuelle fluide avant redirection
    setTimeout(() => {
      this.authService.logout();
      this.deconnexionEnCours = false;
      this.router.navigate(['/auth/login']);
    }, 350);
  }
}
