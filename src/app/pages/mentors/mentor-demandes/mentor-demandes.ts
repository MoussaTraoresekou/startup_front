import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../core/services/notification-service';
import { ProjetDetailModalComponent } from '../projet-detail-modal/projet-detail-modal';
import { ProjetDetailDto } from '../../../core/model/ProjetDetailDto';
import { MentorServices } from '../../../core/services/mentor/mentor-services';

@Component({
  selector: 'app-mentor-demandes',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ProjetDetailModalComponent
  ],
  templateUrl: './mentor-demandes.html',
  styleUrl: './mentor-demandes.css'
})
export class MentorDemandesComponent implements OnInit {
  private readonly notification = inject(NotificationService);
  private readonly mentorService = inject(MentorServices);

  readonly demandes = signal<DemandeAccompagnement[]>([]);
  readonly projetActif = signal<ProjetDetailDto | null>(null);
  readonly filtreActif = signal<FiltreDemande>('TOUS');

  chargement = false;
  erreurChargement = false;

  readonly totalTous = computed(() => this.demandes().length);

  readonly totalEnAttente = computed(() =>
    this.demandes().filter(demande => demande.statut === 'EN_ATTENTE').length
  );

  readonly totalAcceptees = computed(() =>
    this.demandes().filter(demande => demande.statut === 'ACCEPTEE').length
  );

  readonly totalRefusees = computed(() =>
    this.demandes().filter(demande => demande.statut === 'REFUSEE').length
  );

  readonly demandesFiltrees = computed(() => {
    const filtre = this.filtreActif();

    if (filtre === 'TOUS') {
      return this.demandes();
    }

    return this.demandes().filter(demande => demande.statut === filtre);
  });

  ngOnInit(): void {
    this.chargerDemandes();
  }

  changerFiltre(nouveauFiltre: FiltreDemande): void {
    this.filtreActif.set(nouveauFiltre);
  }

  chargerDemandes(): void {
    this.erreurChargement = false;

    this.mentorService.getAllDemandAcccompagnement().subscribe({
      next: donnees => {
        this.demandes.set(donnees ?? []);
      },
      error: erreur => {
        this.erreurChargement = true;
        this.demandes.set([]);

        this.notification.erreur(
          'Impossible de charger les demandes. Veuillez réessayer.'
        );

        console.error('Erreur de chargement des demandes :', erreur);
      }
    });
  }

  chargerEtOuvrirProjet(projetId: number): void {
    if (this.chargement) {
      return;
    }

    this.chargement = true;

    this.mentorService.getInfoProjet(projetId)
      .pipe(finalize(() => this.chargement = false))
      .subscribe({
        next: projet => this.projetActif.set(projet),
        error: erreur => {
          this.notification.erreur(
            'Impossible de charger les détails du projet.'
          );

          console.error('Erreur lors du chargement du projet :', erreur);
        }
      });
  }

  fermerModaleProjet(): void {
    this.projetActif.set(null);
  }

  accepterInvitation(id: number, projetTitre: string): void {
    this.traiterInvitation(id, projetTitre, 'accepter');
  }

  refuserInvitation(id: number, projetTitre: string): void {
    this.traiterInvitation(id, projetTitre, 'refuser');
  }

  private traiterInvitation(
    id: number,
    projetTitre: string,
    action: ActionInvitation
  ): void {
    if (this.chargement) {
      return;
    }

    this.chargement = true;

    const requete = action === 'accepter'
      ? this.mentorService.accepetAcompagnement(id)
      : this.mentorService.refuserAcompagnement(id);

    requete
      .pipe(finalize(() => this.chargement = false))
      .subscribe({
        next: () => {
          const nouveauStatut: StatutDemande =
            action === 'accepter' ? 'ACCEPTEE' : 'REFUSEE';

          this.demandes.update(liste =>
            liste.map(demande =>
              demande.id === id
                ? { ...demande, statut: nouveauStatut }
                : demande
            )
          );

          if (action === 'accepter') {
            this.notification.succes(
              `Vous avez accepté d'accompagner le projet ${projetTitre}.`
            );
          } else {
            this.notification.succes(
              `Vous avez décliné l'invitation du projet ${projetTitre}.`
            );
          }
        },
        error: erreur => {
          console.error(
            `Erreur lors de l'action "${action}" sur l'invitation ${id} :`,
            erreur
          );
        }
      });
  }
}