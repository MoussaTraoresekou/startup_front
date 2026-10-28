
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { NotificationService } from '../../../core/services/notification-service';
import { TacheService } from '../../../core/services/tache/tache-service';
import { PoteurService } from '../../../core/services/porteur/poteur-service';

import { Tache } from '../../../core/model/tache';
import { TacheCreation } from '../../../core/model/tache-creation';
import { TacheVerification } from '../../../core/model/tache-verification';
import { MembreEquipeDto } from '../../../core/model/MembreEquipeDto';

type StatutTache =
  | 'A_FAIRE'
  | 'SOUMIS'
  | 'A_CORRIGER'
  | 'VALIDEE';

type FiltreTache = 'TOUTES' | StatutTache;

@Component({
  selector: 'app-taches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './taches.html',
  styleUrl: './taches.css'
})
export class Taches implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tacheService = inject(TacheService);
  private readonly porteurService = inject(PoteurService);
  chargementRenduId = signal<number | null>(null);

  messageSnakBar = inject(NotificationService);

  // ==================== PROJET ====================

  projetId = 0;

  // ==================== DONNÉES ====================

  taches = signal<Tache[]>([]);

  membresEquipe = signal<MembreEquipeDto[]>([]);

  tacheSelectionnee = signal<Tache | null>(null);

  // ==================== CHARGEMENTS ====================

  chargement = signal(false);

  chargementMembres = signal(false);

  enregistrement = signal(false);

  // ==================== FILTRES ====================

  filtreActif = signal<FiltreTache>('TOUTES');

  tachesFiltrees = computed(() => {
    const filtre = this.filtreActif();

    if (filtre === 'TOUTES') {
      return this.taches();
    }

    return this.taches().filter(
      tache => tache.statut === filtre
    );
  });

  // ==================== STATISTIQUES ====================

  nombreTotal = computed(
    () => this.taches().length
  );

  nombreAFaire = computed(
    () =>
      this.taches().filter(
        tache => tache.statut === 'A_FAIRE'
      ).length
  );

  nombreASoumettre = computed(
    () =>
      this.taches().filter(
        tache => tache.statut === 'SOUMIS'
      ).length
  );

  nombreARevoir = computed(
    () =>
      this.taches().filter(
        tache => tache.statut === 'A_CORRIGER'
      ).length
  );

  nombreValidees = computed(
    () =>
      this.taches().filter(
        tache => tache.statut === 'VALIDEE'
      ).length
  );

  // Objet regroupant les compteurs pour le template.
  compteurs = computed(() => ({
    total: this.nombreTotal(),
    aFaire: this.nombreAFaire(),
    soumises: this.nombreASoumettre(),
    aRevoir: this.nombreARevoir(),
    validees: this.nombreValidees()
  }));

  // ==================== FORMULAIRE ====================

  formulaireOuvert = signal(false);

  nouvelleTache: {
    titre: string;
    description: string;
    dateEcheance: string;
    membreResponsableId: number | null;
  } = this.nouveauFormulaire();

  commentaireVerification = '';

  // ==================== INITIALISATION ====================

  ngOnInit(): void {
    const id = this.route.parent?.snapshot.paramMap.get('id');

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      this.messageSnakBar.erreur(
        'Impossible de récupérer l’identifiant du projet.'
      );
      return;
    }

    this.projetId = Number(id);

    this.chargerTaches();
    this.chargerMembresEquipe();
  }

  // ==================== CHARGEMENT DES TÂCHES ====================

  chargerTaches(): void {
    if (!this.projetId) {
      return;
    }

    this.chargement.set(true);

    this.tacheService.obtenirTachesProjet(this.projetId).subscribe({
      next: (resultat: Tache[]) => {
        this.taches.set(resultat);

        const selectionActuelle = this.tacheSelectionnee();

        if (selectionActuelle) {
          const tacheActualisee = resultat.find(
            tache => tache.id === selectionActuelle.id
          );

          this.tacheSelectionnee.set(tacheActualisee ?? null);

          if (tacheActualisee) {
            this.commentaireVerification =
              tacheActualisee.commentaireVerification ?? '';
          }
        } else if (resultat.length > 0) {
          this.selectionnerTache(resultat[0]);
        }

        this.chargement.set(false);
      },

      error: (erreur) => {
        console.error(
          'Erreur lors du chargement des tâches :',
          erreur
        );

        this.chargement.set(false);

        this.messageSnakBar.erreur(
          erreur?.error?.message ||
          'Impossible de charger les tâches du projet.'
        );
      }
    });
  }

  // ==================== CHARGEMENT DES MEMBRES ====================

  chargerMembresEquipe(): void {
    if (!this.projetId) {
      return;
    }

    this.chargementMembres.set(true);

    this.porteurService.getMesEquipes(this.projetId).subscribe({
      next: (membres: MembreEquipeDto[]) => {
        this.membresEquipe.set(membres);
        this.chargementMembres.set(false);
      },

      error: (erreur) => {
        console.error(
          'Erreur lors du chargement des membres de l’équipe :',
          erreur
        );

        this.membresEquipe.set([]);
        this.chargementMembres.set(false);

        this.messageSnakBar.erreur(
          erreur?.error?.message ||
          'Impossible de charger les membres de l’équipe.'
        );
      }
    });
  }

  // ==================== SÉLECTION ET FILTRES ====================

  selectionnerTache(tache: Tache): void {
    this.tacheSelectionnee.set(tache);

    this.commentaireVerification =
      tache.commentaireVerification ?? '';
  }

  changerFiltre(filtre: FiltreTache): void {
    this.filtreActif.set(filtre);

    const selection = this.tacheSelectionnee();
    const liste = this.tachesFiltrees();

    if (
      selection &&
      !liste.some(tache => tache.id === selection.id)
    ) {
      if (liste.length > 0) {
        this.selectionnerTache(liste[0]);
      } else {
        this.tacheSelectionnee.set(null);
        this.commentaireVerification = '';
      }
    } else if (!selection && liste.length > 0) {
      this.selectionnerTache(liste[0]);
    }
  }

  // ==================== CRÉATION D'UNE TÂCHE ====================

  ouvrirFormulaire(): void {
    this.nouvelleTache = this.nouveauFormulaire();
    this.formulaireOuvert.set(true);
  }

  fermerFormulaire(): void {
    if (this.enregistrement()) {
      return;
    }

    this.formulaireOuvert.set(false);
  }

  creerTache(): void {
    const titre = this.nouvelleTache.titre.trim();
    const description = this.nouvelleTache.description.trim();
    const membreId = Number(
      this.nouvelleTache.membreResponsableId
    );

    if (!titre) {
      this.messageSnakBar.erreur(
        'Veuillez saisir le titre de la tâche.'
      );
      return;
    }

    if (!description) {
      this.messageSnakBar.erreur(
        'Veuillez saisir la description de la tâche.'
      );
      return;
    }

    if (
      !Number.isInteger(membreId) ||
      membreId <= 0
    ) {
      this.messageSnakBar.erreur(
        'Veuillez sélectionner un membre responsable.'
      );
      return;
    }

    const dto: TacheCreation = {
      titre,
      description,
      dateEcheance:
        this.nouvelleTache.dateEcheance || null,
      membreResponsableId: membreId
    };

    this.enregistrement.set(true);

    this.tacheService.creerTache(
      this.projetId,
      dto
    ).subscribe({
      next: (tacheCreee: Tache) => {
        this.taches.update(
          liste => [...liste, tacheCreee]
        );

        this.tacheSelectionnee.set(tacheCreee);
        this.commentaireVerification = '';

        this.enregistrement.set(false);
        this.formulaireOuvert.set(false);
        this.nouvelleTache = this.nouveauFormulaire();

        this.messageSnakBar.succes(
          'La tâche a été créée avec succès.'
        );
      },

      error: (erreur) => {
        console.error(
          'Erreur lors de la création de la tâche :',
          erreur
        );

        this.enregistrement.set(false);

        this.messageSnakBar.erreur(
          erreur?.error?.message ||
          'Impossible de créer la tâche.'
        );
      }
    });
  }

  private nouveauFormulaire(): {
    titre: string;
    description: string;
    dateEcheance: string;
    membreResponsableId: number | null;
  } {
    return {
      titre: '',
      description: '',
      dateEcheance: '',
      membreResponsableId: null
    };
  }

  // ==================== VÉRIFICATION DU RENDU ====================

  verifierRendu(statut: 'VALIDEE' | 'A_CORRIGER'): void {
    const tache = this.tacheSelectionnee();

    if (!tache) {
      this.messageSnakBar.erreur(
        'Veuillez sélectionner une tâche.'
      );
      return;
    }

    if (tache.statut !== 'SOUMIS') {
      this.messageSnakBar.erreur(
        'Seules les tâches soumises peuvent être vérifiées.'
      );
      return;
    }

    const commentaire = this.commentaireVerification.trim();

    if (statut === 'A_CORRIGER' && !commentaire) {
      this.messageSnakBar.erreur(
        'Veuillez préciser les corrections attendues.'
      );
      return;
    }

    const dto: TacheVerification = {
      statut,
      commentaireVerification: commentaire || null
    };

    this.enregistrement.set(true);

    this.tacheService.verifierRendu(
      tache.id,
      dto
    ).subscribe({
      next: (tacheModifiee: Tache) => {
        this.remplacerTache(tacheModifiee);
        this.tacheSelectionnee.set(tacheModifiee);

        this.commentaireVerification =
          tacheModifiee.commentaireVerification ?? '';

        this.enregistrement.set(false);

        if (statut === 'VALIDEE') {
          this.messageSnakBar.succes(
            'Le rendu a été validé avec succès.'
          );
        } else {
          this.messageSnakBar.succes(
            'La demande de correction a été enregistrée.'
          );
        }
      },

      error: (erreur) => {
        console.error(
          'Erreur lors de la vérification du rendu :',
          erreur
        );

        this.enregistrement.set(false);

        this.messageSnakBar.erreur(
          erreur?.error?.message ||
          'Impossible de vérifier le rendu.'
        );
      }
    });
  }

  // ==================== MISE À JOUR LOCALE ====================

  private remplacerTache(tacheModifiee: Tache): void {
    this.taches.update(liste =>
      liste.map(tache =>
        tache.id === tacheModifiee.id
          ? tacheModifiee
          : tache
      )
    );
  }

  // ==================== AFFICHAGE DES STATUTS ====================

  afficherStatut(statut: StatutTache): string {
    switch (statut) {
      case 'A_FAIRE':
        return 'À faire';

      case 'SOUMIS':
        return 'À vérifier';

      case 'A_CORRIGER':
        return 'À corriger';

      case 'VALIDEE':
        return 'Validée';

      default:
        return statut;
    }
  }

  classeStatut(statut: StatutTache): string {
    switch (statut) {
      case 'A_FAIRE':
        return 'statut-a-faire';

      case 'SOUMIS':
        return 'statut-soumis';

      case 'A_CORRIGER':
        return 'statut-a-corriger';

      case 'VALIDEE':
        return 'statut-validee';

      default:
        return '';
    }
  }

  // ==================== FORMATAGE DES DATES ====================

  formaterDate(
    date: string | null | undefined
  ): string {
    if (!date) {
      return 'Non définie';
    }

    const valeur = new Date(date);

    if (Number.isNaN(valeur.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(valeur);
  }
  // ==================== CONSULTATION DU RENDU ====================

consulterRendu(tache: Tache): void {
  const nomFichier = tache.renduUrl?.trim();

  if (!nomFichier) {
    this.messageSnakBar.erreur(
      'Aucun fichier de rendu n’est disponible pour cette tâche.'
    );
    return;
  }

  if (this.chargementRenduId() !== null) {
    return;
  }

  // Ouvrir la fenêtre pendant le clic de l'utilisateur
  // pour éviter le blocage des fenêtres contextuelles.
  const fenetre = window.open('about:blank', '_blank');

  if (!fenetre) {
    this.messageSnakBar.erreur(
      'Le navigateur a bloqué l’ouverture du fichier. Autorisez les fenêtres contextuelles puis réessayez.'
    );
    return;
  }

  this.chargementRenduId.set(tache.id);

  this.porteurService
    .obtenirFichierRendu(nomFichier)
    .subscribe({
      next: (fichier: Blob) => {
        const urlFichier = URL.createObjectURL(fichier);

        fenetre.location.href = urlFichier;

        // Libérer l'URL temporaire après le chargement du document.
        window.setTimeout(() => {
          URL.revokeObjectURL(urlFichier);
        }, 300000);

        this.chargementRenduId.set(null);
      },

      error: (erreur) => {
        console.error(
          'Erreur lors de la consultation du rendu :',
          erreur
        );

        fenetre.close();
        this.chargementRenduId.set(null);

        if (erreur.status === 401) {
          this.messageSnakBar.erreur(
            'Votre session a expiré. Veuillez vous reconnecter.'
          );
        } else if (erreur.status === 403) {
          this.messageSnakBar.erreur(
            'Vous n’êtes pas autorisé à consulter ce rendu.'
          );
        } else if (erreur.status === 404) {
          this.messageSnakBar.erreur(
            'Le fichier est introuvable sur le serveur.'
          );
        } else {
          this.messageSnakBar.erreur(
            'Impossible d’ouvrir le rendu. Vérifiez que le serveur fonctionne et réessayez.'
          );
        }
      }
    });
}
}
