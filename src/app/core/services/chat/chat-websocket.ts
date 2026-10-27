import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatWebsocketService implements OnDestroy {
  private client?: Client;
  private subscriptions = new Map<string, StompSubscription>();
  private messagesSubject = new Subject<IMessage>();

  readonly messages$ = this.messagesSubject.asObservable();

  connect(): Promise<void> {
    if (this.client?.connected) {
      return Promise.resolve();
    }

    if (this.client?.active) {
      return new Promise((resolve, reject) => {
        const debut = Date.now();

        const verifier = () => {
          if (this.client?.connected) {
            resolve();
            return;
          }

          if (!this.client?.active || Date.now() - debut > 15000) {
            reject(new Error('Connexion WebSocket impossible.'));
            return;
          }

          setTimeout(verifier, 100);
        };

        verifier();
      });
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return Promise.reject(
        new Error('Session expirée. Veuillez vous reconnecter.')
      );
    }

    return new Promise<void>((resolve, reject) => {
      const client = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        onConnect: () => {
          resolve();
        },

        onStompError: (frame) => {
          console.error('Erreur STOMP :', frame.headers, frame.body);

          reject(
            new Error(frame.body || 'Erreur de connexion STOMP.')
          );
        },

        onWebSocketError: (event) => {
          console.error('Erreur WebSocket :', event);
          reject(new Error('Connexion WebSocket impossible.'));
        }
      });

      this.client = client;
      client.activate();

      setTimeout(() => {
        if (!client.connected) {
          reject(new Error('Délai dépassé lors de la connexion WebSocket.'));
        }
      }, 15000);
    });
  }

  subscribeConversation(conversationId: number): void {
    if (!this.client?.connected) {
      throw new Error('Le WebSocket n’est pas connecté.');
    }

    const destination = `/topic/conversations/${conversationId}`;

    if (this.subscriptions.has(destination)) {
      return;
    }

    const subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        this.messagesSubject.next(message);
      }
    );

    this.subscriptions.set(destination, subscription);
  }

  envoyerMessage(conversationId: number, contenu: string): void {
    if (!this.client?.connected) {
      throw new Error('Le WebSocket n’est pas connecté.');
    }

    const texte = contenu.trim();

    if (!texte) {
      throw new Error('Le message ne peut pas être vide.');
    }

    this.client.publish({
      destination: `/app/conversations/${conversationId}/envoyer`,
      body: JSON.stringify({ contenu: texte })
    });
  }

  unsubscribeConversation(conversationId: number): void {
    const destination = `/topic/conversations/${conversationId}`;

    this.subscriptions.get(destination)?.unsubscribe();
    this.subscriptions.delete(destination);
  }

  disconnect(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();

    void this.client?.deactivate();
    this.client = undefined;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.messagesSubject.complete();
  }
}