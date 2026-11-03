
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth-service';
import { ProfilResponseDto } from '../../../core/model/profil-response.dto';
import { ProfilUpdateDto } from '../../../core/model/profil-update.dto';
import { NotificationService } from '../../../core/services/notification-service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {

  private authService = inject(AuthService);
    messageSnakBar = inject(NotificationService);
  

  profil = signal<ProfilResponseDto | null>(null);

  chargement = signal<boolean>(false);
  enregistrement = signal<boolean>(false);
  modeModification = signal<boolean>(false);

  messageErreur = signal<string>('');
  messageSucces = signal<string>('');

  formulaire = signal<ProfilUpdateDto>({
    nom: '',
    prenom: '',
    telephone: ''
  });

  nomComplet = computed(() => {
    const utilisateur = this.profil();

    if (!utilisateur) return '';

    return `${utilisateur.prenom} ${utilisateur.nom}`.trim();
  });

  initiales = computed(() => {
    const utilisateur = this.profil();

    if (!utilisateur) return 'U';

    const prenom = utilisateur.prenom?.trim() ?? '';
    const nom = utilisateur.nom?.trim() ?? '';

    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || 'U';
  });

  roleLibelle = computed(() => {
    switch (this.profil()?.role) {
      case 'ADMIN':
        return 'Administrateur';

      case 'PORTEUR':
        return 'Porteur de projet';

      case 'MENTOR':
        return 'Mentor';

      case 'INVESTISSEUR':
        return 'Investisseur';

      case 'COLLABORATEUR':
        return 'Collaborateur';

      default:
        return 'Utilisateur';
    }
  });
  ngOnInit(): void {
    this.chargerProfil();
  }

  chargerProfil(): void {
    this.chargement.set(true);
    this.messageErreur.set('');

    this.authService.getProfil().subscribe({
      next: (profil) => {
        console.log('Profil reçu du backend :', profil);

        this.profil.set(profil);
        this.initialiserFormulaire(profil);

        this.chargement.set(false);
      },

      error: (erreur) => {
        console.error('Erreur chargement profil :', erreur);

        this.messageErreur.set(
          'Impossible de charger les informations de votre profil.'
        );

        this.chargement.set(false);
      }
    });
  }

  private initialiserFormulaire(profil: ProfilResponseDto | null): void {
    if (!profil) return;

    this.formulaire.set({
      nom: profil.nom ?? '',
      prenom: profil.prenom ?? '',
      telephone: profil.telephone ?? ''
    });
  }

  modifierChamp(
    champ: keyof ProfilUpdateDto,
    valeur: string
  ): void {
    this.formulaire.update(formulaire => ({
      ...formulaire,
      [champ]: valeur
    }));
  }
  activerModification(): void {
    this.messageErreur.set('');
    this.messageSucces.set('');

    this.initialiserFormulaire(this.profil());
    this.modeModification.set(true);
  }

  annulerModification(): void {
    this.initialiserFormulaire(this.profil());
    this.modeModification.set(false);

    this.messageErreur.set('');
    this.messageSucces.set('');
  }

  modifierProfil(): void {
    if (this.enregistrement() || !this.profil()) return;

    const formulaire = this.formulaire();

    const donnees: ProfilUpdateDto = {
      nom: formulaire.nom.trim(),
      prenom: formulaire.prenom.trim(),
      telephone: formulaire.telephone.trim()
    };

    if (!donnees.nom || !donnees.prenom || !donnees.telephone) {
      this.messageErreur.set(
        'Veuillez remplir tous les champs obligatoires.'
      );
      return;
    }

    this.enregistrement.set(true);
    this.messageErreur.set('');
    this.messageSucces.set('');

    this.authService.modifierProfil(donnees).subscribe({
      next: (profilModifie) => {
        this.profil.set(profilModifie);
        this.initialiserFormulaire(profilModifie);

        this.modeModification.set(false);
        this.enregistrement.set(false);
                this.messageSnakBar.succes("Votre profil a été modifié avec succès.")
      },

      error: (erreur) => {
        console.error('Erreur modification profil :', erreur);

        this.messageErreur.set(
          erreur?.error?.message ??
          'Une erreur est survenue lors de la modification du profil.'
        );

        this.enregistrement.set(false);
      }
    });
  }
}
