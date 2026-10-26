
import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  DestroyRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ConversationService } from '../../../core/services/conversation/conversation-service';
import { MessagerieService } from '../../../core/services/messagerie/messagerie-service';
import { AuthService } from '../../../core/services/auth-service';
import { ConversationModel } from '../../../core/model/ConversationModel';
import { MessageModel } from '../../../core/model/message';

@Component({
  selector: 'app-discussion',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './discussion.html',
  styleUrl: './discussion.css'
})
export class Discussion implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly conversationService = inject(ConversationService);
  private readonly messagerieService = inject(MessagerieService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  projetId = signal<number>(0);

  conversations = signal<ConversationModel[]>([]);
  conversationActive = signal<ConversationModel | null>(null);
  messages = signal<MessageModel[]>([]);

  contenu = signal<string>('');

  chargementConversations = signal<boolean>(false);
  chargementMessages = signal<boolean>(false);
  connexionEnCours = signal<boolean>(false);

  erreur = signal<string>('');
  erreurEnvoi = signal<string>('');

  utilisateurId = computed(() => this.authService.getUserId());

  ngOnInit(): void {
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    const id = Number(idParam ?? 0);

    this.projetId.set(
      Number.isInteger(id) && id > 0 ? id : 0
    );

    this.messagerieService.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((donnees: MessageModel[]) => {
        this.messages.set(donnees);
      });

    this.recupererConversations();
  }

  recupererConversations(): void {
    this.chargementConversations.set(true);
    this.erreur.set('');

    this.conversationService.mesConversations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (donnees: ConversationModel[]) => {
          const idProjet = this.projetId();

          const filtre = idProjet > 0
            ? donnees.filter(
                (conversation) => conversation.projetId === idProjet
              )
            : donnees;

          this.conversations.set(filtre);
          this.chargementConversations.set(false);

          const active = this.conversationActive();

          const conversationActualisee = active
            ? filtre.find(
                (conversation) => conversation.id === active.id
              )
            : undefined;

          if (conversationActualisee) {
            this.conversationActive.set(conversationActualisee);
          } else if (filtre.length > 0) {
            void this.selectionnerConversation(filtre[0]);
          } else {
            this.conversationActive.set(null);
            this.messages.set([]);
            this.messagerieService.deconnecter();
            this.chargementMessages.set(false);
            this.connexionEnCours.set(false);
          }
        },
        error: (erreur) => {
          console.error(
            'Erreur de chargement des conversations :',
            erreur
          );

          this.erreur.set(
            'Impossible de charger les conversations.'
          );

          this.chargementConversations.set(false);
        }
      });
  }

  async selectionnerConversation(
    conversation: ConversationModel
  ): Promise<void> {
    if (
      this.conversationActive()?.id === conversation.id &&
      !this.chargementMessages() &&
      !this.erreur()
    ) {
      return;
    }

    this.conversationActive.set(conversation);
    this.messages.set([]);
    this.contenu.set('');
    this.erreur.set('');
    this.erreurEnvoi.set('');

    this.chargementMessages.set(true);
    this.connexionEnCours.set(true);

    this.messagerieService.deconnecter();

    try {
      await this.messagerieService.ouvrirConversation(
        conversation.id
      );

      if (this.conversationActive()?.id !== conversation.id) {
        return;
      }

      this.conversationService.historique(conversation.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (historique: MessageModel[]) => {
            if (this.conversationActive()?.id !== conversation.id) {
              return;
            }

            this.messagerieService.chargerHistorique(historique);

            this.chargementMessages.set(false);
            this.connexionEnCours.set(false);
          },
          error: (erreur) => {
            console.error(
              'Erreur de chargement des messages :',
              erreur
            );

            if (this.conversationActive()?.id !== conversation.id) {
              return;
            }

            this.erreur.set(
              'Impossible de charger les messages.'
            );

            this.chargementMessages.set(false);
            this.connexionEnCours.set(false);
          }
        });
    } catch (erreur) {
      console.error(
        'Erreur de connexion WebSocket :',
        erreur
      );

      if (this.conversationActive()?.id !== conversation.id) {
        return;
      }

      this.erreur.set('Connexion au chat impossible.');
      this.chargementMessages.set(false);
      this.connexionEnCours.set(false);
    }
  }

  envoyerMessage(): void {
    const texte = this.contenu().trim();
    const conversation = this.conversationActive();

    if (
      !texte ||
      !conversation ||
      this.chargementMessages() ||
      this.connexionEnCours()
    ) {
      return;
    }

    this.erreurEnvoi.set('');

    try {
      this.messagerieService.envoyer(
        conversation.id,
        { contenu: texte }
      );

      this.contenu.set('');
    } catch (erreur) {
      console.error(
        'Erreur d’envoi du message :',
        erreur
      );

      this.erreurEnvoi.set(
        'Impossible d’envoyer le message.'
      );
    }
  }

  reinitialiserErreur(): void {
    this.erreurEnvoi.set('');
  }

  estMonMessage(message: MessageModel): boolean {
    return message.expediteurId === this.utilisateurId();
  }

  nomInterlocuteur(
    conversation: ConversationModel
  ): string {
    const idUtilisateur = this.utilisateurId();

    if (conversation.investisseurId === idUtilisateur) {
      return conversation.porteurNom || 'Porteur de projet';
    }

    return conversation.investisseurNom || 'Investisseur';
  }
}
