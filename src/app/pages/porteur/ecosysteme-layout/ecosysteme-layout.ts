import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth-service';
import { NotificationSseService } from '../../../core/services/notificationSpring/notification-sse-service';
import { NavbarLayout } from '../../../layout/navbar-layout/navbar-layout';

@Component({
  selector: 'app-ecosysteme-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    NavbarLayout // 📢 Injection du sélecteur dans le scope de la page
  ],
  templateUrl: './ecosysteme-layout.html',
  styleUrl: './ecosysteme-layout.css'
})
export class EcosystemeLayout implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  public sseService = inject(NotificationSseService);
  private router = inject(Router);

  deconnexionEnCours = false;

  ngOnInit(): void {
    const currentUserId = this.authService.getUtilisateurId();
    this.sseService.connecterAuFluxFlux(currentUserId);
  }

  ngOnDestroy(): void {
    this.sseService.fermerConnexion();
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
