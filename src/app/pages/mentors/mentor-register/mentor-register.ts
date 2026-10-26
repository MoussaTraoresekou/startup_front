
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

import { NotificationService } from '../../../core/services/notification-service';
import { MentorServices } from '../../../core/services/mentor/mentor-services';
import { MentorResponseDto } from '../../../core/model/MentorResponseDto';
import { SecteurService } from '../../../core/services/secteur/secteur-service';
import { SecteurReponse } from '../../../core/model/secteurReponse';

@Component({
  selector: 'app-register-mentor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './mentor-register.html',
  styleUrls: ['./mentor-register.css']
})
export class MentorRegister {
  private fb = inject(FormBuilder);
  private mentorService = inject(MentorServices);
  private router = inject(Router);
  private secteurService = inject(SecteurService);

  public listeSecteur = signal<SecteurReponse[]>([]);
  message = inject(NotificationService);

  registerForm: FormGroup;
  hidePassword = true;
  chargement = false;

  // Fichiers conservés localement jusqu'à l'inscription
  fichierCV: File | null = null;
  fichierDiplome: File | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      motDePass: ['', [Validators.required, Validators.minLength(6)]],
      telephone: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      secteur: ['', Validators.required]
    });

    this.secteurService.getSecteurs().subscribe({
      next: (donnees) => {
        this.listeSecteur.set(donnees);
      },
      error: (erreur) => {
        console.error(erreur);
        this.message.erreur(
          'Impossible de charger les secteurs d’activité.'
        );
      }
    });
  }

  /**
   * Sélectionne un CV ou un diplôme PDF sans utiliser de stockage cloud.
   */
  public onFileSelected(
    event: Event,
    typeDocument: 'cvUrl' | 'diplomeUrl'
  ): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];

    if (!fichier) {
      return;
    }

    // Vérification du type et de l'extension
    const estPDF =
      fichier.type === 'application/pdf' &&
      fichier.name.toLowerCase().endsWith('.pdf');

    if (!estPDF) {
      this.message.erreur(
        'Seuls les documents au format PDF sont acceptés.'
      );
      input.value = '';
      return;
    }

    // Limite cohérente avec le stockage configuré côté Spring Boot
    const tailleMaximale = 50 * 1024 * 1024;

    if (fichier.size > tailleMaximale) {
      this.message.erreur(
        'Le document ne doit pas dépasser 50 Mo.'
      );
      input.value = '';
      return;
    }

    if (typeDocument === 'cvUrl') {
      this.fichierCV = fichier;
      this.message.succes('CV sélectionné avec succès.');
    } else {
      this.fichierDiplome = fichier;
      this.message.succes('Diplôme sélectionné avec succès.');
    }
  }

  /**
   * Retire le document sélectionné avant l'envoi.
   */
  public supprimerFichier(
    event: Event,
    typeDocument: 'cvUrl' | 'diplomeUrl'
  ): void {
    event.preventDefault();
    event.stopPropagation();

    if (typeDocument === 'cvUrl') {
      this.fichierCV = null;
    } else {
      this.fichierDiplome = null;
    }

    // Réinitialise aussi le champ fichier du formulaire HTML.
    const bouton = event.currentTarget as HTMLElement | null;
    const zone = bouton?.closest('.file-upload-zone');
    const input = zone?.querySelector('input[type="file"]') as
      | HTMLInputElement
      | null;

    if (input) {
      input.value = '';
    }
  }

  /**
   * Envoie les informations et les deux PDF directement à Spring Boot.
   */
  public onSubmit(): void {
    if (this.chargement) {
      return;
    }

    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.message.erreur(
        'Veuillez remplir correctement tous les champs obligatoires.'
      );
      return;
    }

    if (!this.fichierCV) {
      this.message.erreur('Veuillez sélectionner votre CV au format PDF.');
      return;
    }

    if (!this.fichierDiplome) {
      this.message.erreur(
        'Veuillez sélectionner votre diplôme au format PDF.'
      );
      return;
    }

    this.chargement = true;

    const valeurs = this.registerForm.getRawValue();
    const formData = new FormData();

    // Informations personnelles
    formData.append('prenom', valeurs.prenom);
    formData.append('nom', valeurs.nom);
    formData.append('email', valeurs.email);
    formData.append('motDePass', valeurs.motDePass);
    formData.append('telephone', valeurs.telephone);
    formData.append('description', valeurs.description);
    formData.append('secteur', String(valeurs.secteur));

    // Documents envoyés au backend
    formData.append('cv', this.fichierCV, this.fichierCV.name);
    formData.append(
      'diplome',
      this.fichierDiplome,
      this.fichierDiplome.name
    );

    this.mentorService.registerMentor(formData).subscribe({
      next: (response: MentorResponseDto) => {
        this.chargement = false;

        this.message.succes(
          'Votre candidature a été soumise avec succès ! Elle est en cours d’analyse.'
        );

        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.chargement = false;

        this.message.erreur(
          error.error?.message ||
          'Une erreur est survenue lors de l’enregistrement de votre profil.'
        );

        console.error('Erreur inscription mentor :', error);
      }
    });
  }
}
