import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationSseService } from '../../../../core/services/notificationSpring/notification-sse-service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './notifications-component.html',
  styleUrl: './notifications-component.css'
})
export class NotificationsComponent implements OnInit {
  public sseService = inject(NotificationSseService);

  ngOnInit(): void {
    this.sseService.rafraichirHistorique();
  }

  public marquerSessionCommeLue(): void {
    if (this.sseService.compteurNonLues() === 0) {
      return;
    }

    this.sseService.marquerSessionCommeLue().subscribe({
      next: () => {
        this.sseService.listeNotifications.update(notifications =>
          notifications.map(notification => ({
            ...notification,
            lu: true
          }))
        );
      },
      error: erreur => {
        console.error(
          'Erreur lors de la lecture des notifications :',
          erreur
        );
      }
    });
  }
}
