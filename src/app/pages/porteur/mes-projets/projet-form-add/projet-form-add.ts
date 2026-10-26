
import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProjetService } from '../../../../core/services/projet-service';
import { SecteurReponse } from '../../../../core/model/secteurReponse';
import { SecteurService } from '../../../../core/services/secteur/secteur-service';
import { NotificationService } from '../../../../core/services/notification-service';

@Component({
  selector: 'app-projet-form-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './projet-form-add.html',
  styleUrl: './projet-form-add.css'
})
export class ProjetFormAdd {
  fermerClic = output<boolean>();
  ajoutReussiMisAjourClic = output<void>();

  private projetService = inject(ProjetService);
  private secteurService = inject(SecteurService);
  private messageSnacbar = inject(NotificationService);

  projectForm: FormGroup;
  fichierPitch: File | null = null;
  chargement = false;

  readonly tailleMaxFichier = 50 * 1024 * 1024;

  public listeSecteurs = signal<SecteurReponse[]>([]);

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      secteur: ['', Validators.required],
      quota: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.secteurService.getSecteurs().subscribe({
      next: (donnees) => this.listeSecteurs.set(donnees),
      error: (erreur) => console.error(
        'Erreur lors du chargement des secteurs :',
        erreur
      )
    });
  }

  fermerModale(): void {
    this.fermerClic.emit(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];

    if (!fichier) {
      this.fichierPitch = null;
      return;
    }

    const extension = fichier.name.split('.').pop()?.toLowerCase();
    const extensionsAutorisees = ['pdf', 'mp4'];

    if (!extension || !extensionsAutorisees.includes(extension)) {
      this.messageSnacbar.erreur(
        'Format non autorisé. Sélectionnez un fichier PDF ou MP4.'
      );
      input.value = '';
      this.fichierPitch = null;
      return;
    }

    if (fichier.size > this.tailleMaxFichier) {
      this.messageSnacbar.erreur(
        'Le fichier ne doit pas dépasser 50 Mo.'
      );
      input.value = '';
      this.fichierPitch = null;
      return;
    }

    this.fichierPitch = fichier;
  }

  supprimerFichier(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.fichierPitch = null;

    const fileInput = document.getElementById(
      'pitchFile'
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }
  }

  soumettreProjet(): void {
    this.projectForm.markAllAsTouched();

    if (this.projectForm.invalid || this.chargement) {
      return;
    }

    const valeurs = this.projectForm.getRawValue();
    const formulaire = new FormData();

    formulaire.append('titre', String(valeurs.nom).trim());
    formulaire.append('description', String(valeurs.description ?? '').trim());
    formulaire.append('quota_propose', String(valeurs.quota));
    formulaire.append('secteur_id', String(Number(valeurs.secteur)));

    if (this.fichierPitch) {
      formulaire.append(
        'fichierPitch',
        this.fichierPitch,
        this.fichierPitch.name
      );
    }

    this.chargement = true;

    this.projetService.ajouterProjet(formulaire).subscribe({
      next: () => {
        this.chargement = false;
        this.ajoutReussiMisAjourClic.emit();
      },
      error: (erreur) => {
        this.chargement = false;

        console.error(
          "Erreur lors de l'enregistrement du projet :",
          erreur
        );

        this.messageSnacbar.erreur(
          "Erreur lors de l'enregistrement du projet. Vérifiez les informations et réessayez."
        );
      }
    });
  }
}
