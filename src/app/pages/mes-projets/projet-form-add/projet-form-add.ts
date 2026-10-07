import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProjetService } from '../../../core/services/projet-service';
import { SupabaseService } from '../../../core/services/supabase/supabase-service';
import { ProjetRequest } from '../../../core/model/ProjetRequest';

@Component({
  selector: 'app-projet-form-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './projet-form-add.html',
  styleUrl: './projet-form-add.css',
})
export class ProjetFormAdd {
  @Output() fermer = new EventEmitter<void>();
  @Output() projetAjoute = new EventEmitter<void>(); // Événement pour rafraîchir la liste principale

  // Injection moderne des services
  private projetService = inject(ProjetService);
  private supabaseService = inject(SupabaseService);

  projectForm: FormGroup;
  fichierPitch: File | null = null;
  chargement = false; // Indicateur visuel pour bloquer les boutons pendant l'envoi

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      secteur: ['', Validators.required],
      quota: [''],
      description: ['']
    });
  }

  fermerModale(): void {
    this.fermer.emit();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fichierPitch = input.files[0];
    }
  }

  supprimerFichier(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.fichierPitch = null;
    const fileInput = document.getElementById('pitchFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  /**
   * Orchestre la sauvegarde du projet en cascade (Supabase ➡️ Spring Boot) 🚀
   */
  soumettreProjet(): void {
    if (this.projectForm.invalid || this.chargement) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.chargement = true;

    // SCÉNARIO A : Un fichier binaire est présent -> Upload Supabase d'abord
    if (this.fichierPitch) {
      this.supabaseService.uploadPitchFile(this.fichierPitch).subscribe({
        next: (urlPublique: string) => {
          this.envoyerProjetAuBackend(urlPublique);
        },
        error: (err) => {
          this.chargement = false;
          console.error("Erreur lors de l'upload du fichier chez Supabase :", err);
          alert("Échec de l'enregistrement du fichier de pitch.");
        }
      });
    } 
    // SCÉNARIO B : Pas de fichier joint -> pith_url initialisé à vide
    else {
      this.envoyerProjetAuBackend('');
    }
  }

  /**
   * Prépare le DTO final et effectue la requête POST vers le serveur Java
   */
  private envoyerProjetAuBackend(urlDuPitch: string): void {
    const requete: ProjetRequest = {
      titre: this.projectForm.value.nom,
      description: this.projectForm.value.description || '',
      pith_url: urlDuPitch,
      quota_propose: this.projectForm.value.quota || '',
      secteur_id: parseInt(this.projectForm.value.secteur, 10) // Cast en type number pour JPA
    };

    this.projetService.ajouterProjet(requete).subscribe({
      next: (reponse) => {
        this.chargement = false;
        console.log('Projet enregistré avec succès dans la base de données Spring Boot !', reponse);
        this.projetAjoute.emit(); // Déclenche le rechargement de la grille en arrière-plan
        this.fermerModale();     // Ferme proprement la fenêtre flottante
      },
      error: (err) => {
        this.chargement = false;
        console.error('Échec de la communication avec l\'API Spring Boot :', err);
        alert("Erreur lors de l'initialisation du dossier de projet.");
      }
    });
  }
}
