
import {
  Injectable,
  NgZone,
  computed,
  inject,
  signal
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventSourcePolyfill } from 'event-source-polyfill';

import { NotificationResponseDto } from '../../model/NotificationResponseDto';
import { NotificationService } from '../notification-service';

@Injectable({
  providedIn: 'root'
})
export class NotificationSseService {

  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly zone = inject(NgZone);

  private readonly baseUrl = 'http://localhost:8080/api/notifications';

  private eventSource: EventSourcePolyfill | null = null;
  private utilisateurConnecteId: number | null = null;

  // Liste des notifications affichées dans l'application
  readonly listeNotifications = signal<NotificationResponseDto[]>([]);

  // Nombre de notifications non lues
  readonly compteurNonLues = computed(
    () => this.listeNotifications().filter(notification => !notification.lu).length
  );

  /**
   * Établit une connexion SSE pour l'utilisateur connecté.
   */
  connecterAuFluxFlux(userId: number): void {

    const token = localStorage.getItem('token');

    if (!token || userId <= 0) {
      console.error(
        'Connexion SSE impossible : token ou identifiant utilisateur absent.'
      );
      this.fermerConnexion();
      return;
    }

    // Évite de créer plusieurs connexions pour le même utilisateur
    if (
      this.eventSource &&
      this.utilisateurConnecteId === userId
    ) {
      return;
    }

    // Ferme une éventuelle connexion précédente
    this.fermerConnexion();

    this.utilisateurConnecteId = userId;

    // Charge les notifications déjà enregistrées en base
    this.rafraichirHistorique();

    // Connexion SSE avec le JWT
    const source = new EventSourcePolyfill(
      `${this.baseUrl}/flux`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        heartbeatTimeout: 60000
      }
    );

    this.eventSource = source;

    source.onopen = () => {
      console.log('Connexion SSE authentifiée ouverte.');
    };

    // Réception des nouvelles notifications envoyées par Spring Boot
    const notificationListener: EventListener = (event: Event) => {
      this.zone.run(() => {
        try {
          const messageEvent = event as MessageEvent;

          const nouvelleNotification =
            JSON.parse(messageEvent.data) as NotificationResponseDto;

          this.listeNotifications.update(notifications => {
            // Évite d'ajouter deux fois la même notification si elle possède un id
            const id = (nouvelleNotification as any).id;

            if (
              id != null &&
              notifications.some(
                notification => (notification as any).id === id
              )
            ) {
              return notifications;
            }

            return [nouvelleNotification, ...notifications];
          });

          this.notificationService.succes(
            nouvelleNotification.message
          );

          console.log(
            'Nouvelle notification reçue :',
            nouvelleNotification
          );

        } catch (erreur) {
          console.error(
            'Erreur lors de la lecture de la notification SSE :',
            erreur
          );
        }
      });
    };

    // Adaptation du typage de la bibliothèque event-source-polyfill
    const sourceCompatible = source as unknown as {
      addEventListener(
        type: string,
        listener: EventListener
      ): void;
    };

    sourceCompatible.addEventListener(
      'NOTIFICATION_ALERTE',
      notificationListener
    );

    source.onerror = (erreur) => {
  console.error(
    'Erreur de connexion SSE. Vérifie le JWT et le backend.',
    erreur
  );
};
  }

/**
 * Recharge les notifications enregistrées en base de données.
 */
public rafraichirHistorique(): void {
  this.http
    .get<NotificationResponseDto[]>(`${this.baseUrl}/historique`)
    .subscribe({
      next: (notifications) => {
        this.zone.run(() => {
          this.listeNotifications.set(notifications);
          console.log('Historique actualisé depuis la BDD :', notifications);
        });
      },
      error: (erreur) => {
        console.error('Erreur lors du rechargement de l’historique :', erreur);
      }
    });
}


  /**
   * Marque toutes les notifications comme lues côté serveur.
   */
  marquerSessionCommeLue(): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/marquer-lu`,
      {},
      { responseType: 'text' }
    );
  }

  /**
   * Ferme la connexion SSE.
   */
  fermerConnexion(): void {

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;

      console.log('Connexion SSE fermée.');
    }

    this.utilisateurConnecteId = null;
  }
}
