
import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessageModel } from '../../model/message';
import { EnvoyerMessageDTO } from '../../model/EnvoyerMessageDTO';

@Injectable({
  providedIn: 'root'
})
export class MessagerieService {
  private client?: Client;
  private subscription?: StompSubscription;
  private conversationActiveId?: number;

  private readonly messagesSubject =
    new BehaviorSubject<MessageModel[]>([]);

  readonly messages$: Observable<MessageModel[]> =
    this.messagesSubject.asObservable();

  private readonly connexionSubject =
    new BehaviorSubject<boolean>(false);

  readonly connecte$: Observable<boolean> =
    this.connexionSubject.asObservable();

  /**
   * Ouvre la connexion WebSocket authentifiée.
   */
  connecter(): Promise<void> {
    if (this.client?.connected) {
      this.connexionSubject.next(true);
      return Promise.resolve();
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return Promise.reject(
        new Error('Aucun token JWT. Veuillez vous reconnecter.')
      );
    }

    if (this.client?.active) {
      return Promise.reject(
        new Error('La connexion WebSocket est en cours.')
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
          this.connexionSubject.next(true);
          resolve();
        },

        onDisconnect: () => {
          this.connexionSubject.next(false);
        },

        onWebSocketClose: () => {
          this.connexionSubject.next(false);
        },

        onStompError: (frame) => {
          console.error(
            'Erreur STOMP :',
            frame.headers['message'],
            frame.body
          );

          this.connexionSubject.next(false);
          reject(new Error(
            frame.headers['message'] ?? 'Erreur STOMP'
          ));
        }
      });

      this.client = client;

      client.activate();
    });
  }

  /**
   * S'abonne aux messages d'une conversation.
   */
  async ouvrirConversation(conversationId: number): Promise<void> {
    if (!this.client?.connected) {
      await this.connecter();
    }

    if (!this.client?.connected) {
      throw new Error('La connexion WebSocket n’est pas établie.');
    }

    if (
      this.conversationActiveId === conversationId &&
      this.subscription
    ) {
      return;
    }

    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.conversationActiveId = conversationId;
    this.messagesSubject.next([]);

    this.subscription = this.client.subscribe(
      `/topic/conversations/${conversationId}`,
      (message: IMessage) => {
        try {
          const nouveauMessage =
            JSON.parse(message.body) as MessageModel;

          const messages = this.messagesSubject.value;

          // Évite les doublons si le backend diffuse un message
          // déjà présent dans l'historique.
          if (messages.some(m => m.id === nouveauMessage.id)) {
            return;
          }

          this.messagesSubject.next([
            ...messages,
            nouveauMessage
          ]);
        } catch (error) {
          console.error(
            'Impossible de lire le message WebSocket :',
            error
          );
        }
      }
    );
  }

  /**
   * Charge l'historique REST dans la liste des messages.
   */
  chargerHistorique(messages: MessageModel[]): void {
    const messagesActuels = this.messagesSubject.value;

    const tousLesMessages = [...messages, ...messagesActuels];

    const uniques = new Map<number, MessageModel>();

    for (const message of tousLesMessages) {
      uniques.set(message.id, message);
    }

    this.messagesSubject.next(
      [...uniques.values()].sort(
        (a, b) =>
          new Date(a.dateEnvoi).getTime() -
          new Date(b.dateEnvoi).getTime()
      )
    );
  }

  /**
   * Envoie le message au contrôleur WebSocket Spring Boot.
   */
  envoyer(conversationId: number, dto: EnvoyerMessageDTO): void {
    if (!this.client?.connected) {
      throw new Error('La connexion WebSocket est interrompue.');
    }

    if (this.conversationActiveId !== conversationId) {
      throw new Error('Cette conversation n’est pas active.');
    }

    const contenu = dto.contenu.trim();

    if (!contenu) {
      return;
    }

    this.client.publish({
      destination:
        `/app/conversations/${conversationId}/envoyer`,
      body: JSON.stringify({ contenu })
    });
  }

  /**
   * Ferme la connexion et libère l'abonnement.
   */
  async deconnecter(): Promise<void> {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.conversationActiveId = undefined;

    if (this.client?.active) {
      await this.client.deactivate();
    }

    this.client = undefined;
    this.messagesSubject.next([]);
    this.connexionSubject.next(false);
  }
}
