import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

import { PoteurService } from '../../../../core/services/porteur/poteur-service';
import { Tache } from '../../../../core/model/tache';

type FiltreStatut =
  | 'TOUTES'
  | 'A_FAIRE'
  | 'SOUMIS'
  | 'A_CORRIGER'
  | 'VALIDEE';

const TAILLE_MAX_FICHIER = 50 * 1024 * 1024;

@Component({
  selector: 'app-mes-taches',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './mes-taches.html',
  styleUrl: './mes-taches.css',
})
export class MesTaches {
  private readonly porteurServices = inject(PoteurService);
  private readonly destroyRef = inject(DestroyRef);

  // ==================== DONNÉES ====================

  taches = signal<Tache[]>([]);
  chargement = signal(true);
  erreur = signal<string | null>(null);

  recherche = signal('');
  filtreStatut = signal<FiltreStatut>('TOUTES');
  projetSelectionne = signal<number | null>(null);

  // ==================== FORMULAIRE DE RENDU ====================

  formulaireOuvertId = signal<number | null>(null);
  descriptionRendu = signal('');
  fichierSelectionne = signal<File | null>(null);

  soumissionEnCoursId = signal<number | null>(null);
  erreurSoumission = signal<string | null>(null);
  messageSucces = signal<string | null>(null);

  // ==================== CONSULTATION DES FICHIERS ====================

  chargementFichierId = signal<number | null>(null);
  erreurFichier = signal<string | null>(null);

  // ==================== INDICATEURS ====================

  nombreAFaire = computed(
    () => this.taches().filter(t => t.statut === 'A_FAIRE').length
  );

  nombreSoumises = computed(
    () => this.taches().filter(t => t.statut === 'SOUMIS').length
  );

  nombreACorriger = computed(
    () => this.taches().filter(t => t.statut === 'A_CORRIGER').length
  );

  nombreValidees = computed(
    () => this.taches().filter(t => t.statut === 'VALIDEE').length
  );

  // ==================== PROJETS ====================

  projets = computed(() => {
    const projetsUniques = new Map<number, string>();

    for (const tache of this.taches()) {
      projetsUniques.set(tache.projetId, tache.projetTitre);
    }

    return Array.from(projetsUniques, ([id, titre]) => ({
      id,
      titre,
    })).sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));
  });

  // ==================== FILTRAGE DES TÂCHES ====================

  tachesFiltrees = computed(() => {
    const recherche = this.recherche().trim().toLocaleLowerCase();
    const statut = this.filtreStatut();
    const projetId = this.projetSelectionne();

    return this.taches()
      .filter(tache => {
        const correspondStatut =
          statut === 'TOUTES' || tache.statut === statut;

        const correspondProjet =
          projetId === null || tache.projetId === projetId;

        const texte = [
          tache.titre,
          tache.description ?? '',
          tache.projetTitre,
        ].join(' ').toLocaleLowerCase();

        const correspondRecherche =
          recherche.length === 0 || texte.includes(recherche);

        return (
          correspondStatut &&
          correspondProjet &&
          correspondRecherche
        );
      })
      .sort((a, b) => {
        if (!a.dateEcheance && !b.dateEcheance) {
          return 0;
        }

        if (!a.dateEcheance) {
          return 1;
        }

        if (!b.dateEcheance) {
          return -1;
        }

        return a.dateEcheance.localeCompare(b.dateEcheance);
      });
  });

  constructor() {
    this.chargerTaches();
  }

  // ==================== CHARGEMENT ====================

  private chargerTaches(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.porteurServices
      .obtenirmesTaches()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (taches: Tache[]) => {
          this.taches.set(taches ?? []);
          this.chargement.set(false);
        },

        error: (err: HttpErrorResponse) => {
          console.error(
            'Erreur lors du chargement des tâches :',
            err
          );

          this.erreur.set(
            err.status === 401
              ? 'Votre session a expiré. Veuillez vous reconnecter.'
              : 'Impossible de charger vos tâches. Veuillez réessayer.'
          );

          this.chargement.set(false);
        },
      });
  }

  // ==================== RECHERCHE ET FILTRES ====================

  changerRecherche(event: Event): void {
    const valeur = (event.target as HTMLInputElement).value;
    this.recherche.set(valeur);
  }

  changerProjet(event: Event): void {
    const valeur = (event.target as HTMLSelectElement).value;

    this.projetSelectionne.set(
      valeur === '' ? null : Number(valeur)
    );
  }

  changerFiltre(statut: FiltreStatut): void {
    this.filtreStatut.set(statut);
  }

  reinitialiserFiltres(): void {
    this.recherche.set('');
    this.projetSelectionne.set(null);
    this.filtreStatut.set('TOUTES');
  }

  // ==================== OUVERTURE DU FORMULAIRE ====================

  ouvrirFormulaire(tacheId: number): void {
    if (this.soumissionEnCoursId() !== null) {
      return;
    }

    const formulaireActuel = this.formulaireOuvertId();

    if (formulaireActuel === tacheId) {
      this.fermerFormulaire();
      return;
    }

    if (formulaireActuel !== null) {
      this.reinitialiserChampFichier(formulaireActuel);
    }

    this.formulaireOuvertId.set(tacheId);
    this.descriptionRendu.set('');
    this.fichierSelectionne.set(null);
    this.erreurSoumission.set(null);
    this.messageSucces.set(null);
    this.erreurFichier.set(null);
  }

  fermerFormulaire(): void {
    if (this.soumissionEnCoursId() !== null) {
      return;
    }

    const tacheId = this.formulaireOuvertId();

    if (tacheId !== null) {
      this.reinitialiserChampFichier(tacheId);
    }

    this.formulaireOuvertId.set(null);
    this.descriptionRendu.set('');
    this.fichierSelectionne.set(null);
    this.erreurSoumission.set(null);
  }

  private reinitialiserChampFichier(tacheId: number): void {
    const input = document.getElementById(
      `fichier-rendu-${tacheId}`
    ) as HTMLInputElement | null;

    if (input) {
      input.value = '';
    }
  }

  // ==================== DESCRIPTION DU RENDU ====================

  changerDescriptionRendu(event: Event): void {
    const valeur = (event.target as HTMLTextAreaElement).value;

    this.descriptionRendu.set(valeur);
    this.erreurSoumission.set(null);
  }

  // ==================== SÉLECTION DU FICHIER ====================

  selectionnerFichier(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0] ?? null;

    this.erreurSoumission.set(null);

    if (!fichier) {
      this.fichierSelectionne.set(null);
      return;
    }

    const nom = fichier.name.toLowerCase();

    const estPDF =
      nom.endsWith('.pdf') &&
      fichier.type === 'application/pdf';

    const estMP4 =
      nom.endsWith('.mp4') &&
      (
        fichier.type === 'video/mp4' ||
        fichier.type === 'application/octet-stream'
      );

    if (!estPDF && !estMP4) {
      this.fichierSelectionne.set(null);
      input.value = '';

      this.erreurSoumission.set(
        'Seuls les fichiers PDF et MP4 sont acceptés.'
      );
      return;
    }

    if (fichier.size > TAILLE_MAX_FICHIER) {
      this.fichierSelectionne.set(null);
      input.value = '';

      this.erreurSoumission.set(
        'Le fichier ne doit pas dépasser 50 Mo.'
      );
      return;
    }

    if (fichier.size === 0) {
      this.fichierSelectionne.set(null);
      input.value = '';

      this.erreurSoumission.set(
        'Le fichier sélectionné est vide.'
      );
      return;
    }

    this.fichierSelectionne.set(fichier);
  }

  retirerFichier(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const bouton = event.currentTarget as HTMLElement;
    const zone = bouton.closest('.file-upload-zone');
    const input = zone?.previousElementSibling as HTMLInputElement | null;

    if (input?.type === 'file') {
      input.value = '';
    }

    this.fichierSelectionne.set(null);
    this.erreurSoumission.set(null);
  }

  iconeFichier(fichier: File): string {
    return fichier.name.toLowerCase().endsWith('.pdf')
      ? 'description'
      : 'movie';
  }

  tailleFichier(taille: number): string {
    if (taille < 1024 * 1024) {
      return `${Math.max(1, Math.round(taille / 1024))} Ko`;
    }

    return `${(taille / (1024 * 1024)).toFixed(2)} Mo`;
  }

  // ==================== SOUMISSION DU RENDU ====================

  envoyerRendu(tache: Tache): void {
    const description = this.descriptionRendu().trim();
    const fichier = this.fichierSelectionne();

    if (!description) {
      this.erreurSoumission.set(
        'La description du rendu est obligatoire.'
      );
      return;
    }

    if (!fichier) {
      this.erreurSoumission.set(
        'Veuillez sélectionner un fichier PDF ou MP4.'
      );
      return;
    }

    if (
      tache.statut !== 'A_FAIRE' &&
      tache.statut !== 'A_CORRIGER'
    ) {
      this.erreurSoumission.set(
        'Cette tâche ne peut pas recevoir de rendu dans son état actuel.'
      );
      return;
    }

    this.erreurSoumission.set(null);
    this.messageSucces.set(null);
    this.soumissionEnCoursId.set(tache.id);

    this.porteurServices
      .soumettreRendu(tache.id, description, fichier)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tacheMiseAJour: Tache) => {
          this.taches.update(liste =>
            liste.map(item =>
              item.id === tacheMiseAJour.id
                ? tacheMiseAJour
                : item
            )
          );

          this.reinitialiserChampFichier(tache.id);

          this.messageSucces.set(
            `Le rendu de « ${tache.titre} » a été envoyé avec succès.`
          );

          this.formulaireOuvertId.set(null);
          this.descriptionRendu.set('');
          this.fichierSelectionne.set(null);
          this.erreurSoumission.set(null);
          this.soumissionEnCoursId.set(null);
        },

        error: (err: HttpErrorResponse) => {
          console.error(
            'Erreur lors de la soumission du rendu :',
            err
          );

          const messageServeur = err.error?.message;

          this.erreurSoumission.set(
            typeof messageServeur === 'string'
              ? messageServeur
              : err.status === 401
                ? 'Votre session a expiré. Veuillez vous reconnecter.'
                : err.status === 413
                  ? 'Le fichier est trop volumineux.'
                  : 'Impossible d’envoyer le rendu. Vérifiez le fichier et réessayez.'
          );

          this.soumissionEnCoursId.set(null);
        },
      });
  }

  // ==================== CONSULTATION DU RENDU ====================

  consulterRendu(tache: Tache): void {
    const nomFichier = tache.renduUrl;

    if (!nomFichier) {
      this.erreurFichier.set(
        'Aucun fichier de rendu n’est disponible.'
      );
      return;
    }

    if (this.chargementFichierId() !== null) {
      return;
    }

    // La fenêtre est ouverte directement depuis le clic de l'utilisateur.
    const fenetre = window.open('about:blank', '_blank');

    if (!fenetre) {
      this.erreurFichier.set(
        'Le navigateur a bloqué l’ouverture du fichier. Autorisez les fenêtres contextuelles puis réessayez.'
      );
      return;
    }

    this.erreurFichier.set(null);
    this.chargementFichierId.set(tache.id);

    this.porteurServices
      .obtenirFichierRendu(nomFichier)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (fichier: Blob) => {
          const urlFichier = URL.createObjectURL(fichier);

          fenetre.location.href = urlFichier;
          this.chargementFichierId.set(null);
        },

        error: (err: HttpErrorResponse) => {
          console.error(
            'Erreur lors de la consultation du rendu :',
            err
          );

          fenetre.close();

          this.erreurFichier.set(
            err.status === 401
              ? 'Votre session a expiré. Veuillez vous reconnecter.'
              : err.status === 403
                ? 'Vous n’êtes pas autorisé à consulter ce rendu.'
                : err.status === 404
                  ? 'Le fichier demandé est introuvable.'
                  : 'Impossible d’ouvrir le rendu. Veuillez réessayer.'
          );

          this.chargementFichierId.set(null);
        },
      });
  }

  // ==================== AFFICHAGE DES STATUTS ====================

  libelleStatut(statut: string | null): string {
    switch (statut) {
      case 'A_FAIRE':
        return 'À faire';

      case 'SOUMIS':
        return 'Rendu soumis';

      case 'A_CORRIGER':
        return 'À corriger';

      case 'VALIDEE':
        return 'Validée';

      default:
        return statut ?? 'Non renseigné';
    }
  }

  // ==================== DATES ====================

  formaterDate(date: string | null): string {
    if (!date) {
      return 'Aucune échéance';
    }

    const morceaux = date.split('-');

    if (morceaux.length !== 3) {
      return date;
    }

    return `${morceaux[2]}/${morceaux[1]}/${morceaux[0]}`;
  }

  estEnRetard(tache: Tache): boolean {
    if (
      !tache.dateEcheance ||
      tache.statut === 'VALIDEE' ||
      tache.statut === 'SOUMIS'
    ) {
      return false;
    }

    const echeance = new Date(`${tache.dateEcheance}T00:00:00`);
    const aujourdHui = new Date();

    aujourdHui.setHours(0, 0, 0, 0);

    return echeance < aujourdHui;
  }
}