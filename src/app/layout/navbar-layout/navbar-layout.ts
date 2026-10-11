import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth-service';
import { NotificationSseService } from '../../core/services/notificationSpring/notification-sse-service';

@Component({
  selector: 'app-navbar-layout',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './navbar-layout.html',
  styleUrls: ['./navbar-layout.css']
})
export class NavbarLayout implements OnInit, OnDestroy {
  readonly sseService = inject(NotificationSseService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly role = this.authService.getRole();

  ngOnInit(): void {
    const userId = this.authService.getUserId();

    if (userId > 0 && this.authService.estConnecte()) {
      this.sseService.connecterAuFluxFlux(userId);
    }
  }

  ngOnDestroy(): void {
    this.sseService.fermerConnexion();
  }

  logout(): void {
    this.sseService.fermerConnexion();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}