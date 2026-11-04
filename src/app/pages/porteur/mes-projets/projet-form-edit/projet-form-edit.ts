import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PoteurService } from '../../../../core/services/porteur/poteur-service';
import { SecteurService } from '../../../../core/services/secteur/secteur-service';
import { ProjetResponse } from '../../../../core/model/ProjetResponse';
import { SecteurReponse } from '../../../../core/model/secteurReponse';

@Component({
  selector: 'app-projet-form-edit',
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
  templateUrl: './projet-form-edit.html',
  styleUrl: './projet-form-edit.css'
})
export class ProjetFormEdit implements OnInit {

  private fb = inject(FormBuilder);
  private poteurService = inject(PoteurService);
  private secteurService = inject(SecteurService);

  projet = input.required<ProjetResponse>();

  fermerClic = output<boolean>();
  modificationReussie = output<void>();

  listeSecteurs = signal<SecteurReponse[]>([]);
  fichierPitch = signal<File | null>(null);

  chargement = signal(false);
  chargementSecteurs = signal(false);
  messageErreur = signal('');

  readonly tailleMaxFichier = 50 * 1024 * 1024;

  projectForm = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(3)]],
    secteur: ['', Validators.required],
    quota: ['', Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
    this.chargerSecteurs();
  }

  private chargerSecteurs(): void {
    this.chargementSecteurs.set(true);

    this.secteurService.getSecteurs().subscribe({
      next: (secteurs) => {
        this.listeSecteurs.set(secteurs);

        const projetActuel = this.projet();

        const secteurCorrespondant = secteurs.find(
          secteur =>
            secteur.secteur.trim().toLowerCase() ===
            projetActuel.secteur.trim().toLowerCase()
        );

        this.projectForm.patchValue({
          nom: projetActuel.titre,
          secteur: secteurCorrespondant
            ? String(secteurCorrespondant.id)
            : '',
          quota: projetActuel.quota_propose,
          description: projetActuel.description
        });

        this.chargementSecteurs.set(false);
      },
      error: () => {
        this.messageErreur.set(
          'Impossible de charger les secteurs d’activité.'
        );
        this.chargementSecteurs.set(false);
      }
    });
  }

  selectionnerFichier(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const fichier = inputElement.files?.[0];

    if (!fichier) {
      return;
    }

    const extension = fichier.name.split('.').pop()?.toLowerCase();

    if (!['pdf', 'mp4'].includes(extension ?? '')) {
      this.messageErreur.set('Seuls les fichiers PDF et MP4 sont acceptés.');
      inputElement.value = '';
      return;
    }

    if (fichier.size > this.tailleMaxFichier) {
      this.messageErreur.set('Le fichier ne doit pas dépasser 50 Mo.');
      inputElement.value = '';
      return;
    }

    this.messageErreur.set('');
    this.fichierPitch.set(fichier);
  }

  retirerNouveauFichier(inputElement: HTMLInputElement): void {
    this.fichierPitch.set(null);
    inputElement.value = '';
  }

  fermer(): void {
    this.fermerClic.emit(true);
  }

  modifierProjet(): void {
    if (this.projectForm.invalid || this.chargement()) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const valeurs = this.projectForm.getRawValue();

    const formulaire = new FormData();

    formulaire.append('titre', valeurs.nom!.trim());
    formulaire.append('description', valeurs.description!.trim());
    formulaire.append('quota_propose', valeurs.quota!.trim());
    formulaire.append('secteur_id', valeurs.secteur!);

    const fichier = this.fichierPitch();

    if (fichier) {
      formulaire.append('fichierPitch', fichier);
    }

    this.chargement.set(true);
    this.messageErreur.set('');

    this.poteurService.modifierProjet(
      this.projet().id,
      formulaire
    ).subscribe({
      next: () => {
        this.chargement.set(false);
        this.modificationReussie.emit();
      },
      error: (erreur) => {
        console.error('Erreur modification projet :', erreur);

        this.messageErreur.set(
          erreur.error?.message ??
          'Une erreur est survenue lors de la modification du projet.'
        );

        this.chargement.set(false);
      }
    });
  }
}