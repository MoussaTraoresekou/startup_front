import { Component, EventEmitter, Output, inject, output, signal } from '@angular/core';
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
import { SecteurReponse } from '../../../core/model/secteurReponse';
import { SecteurService } from '../../../core/services/secteur/secteur-service';
import { NotificationService } from '../../../core/services/notification-service';

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
  fermerClic = output<boolean>();
  ajoutReussiMisAjourClic = output<void>();
  private projetService = inject(ProjetService);
  private supabaseService = inject(SupabaseService);
  projectForm: FormGroup;
  fichierPitch: File | null = null;
  chargement = false; 
  public listeSecteurs=signal<SecteurReponse[]>([]);
  private secteurService=inject(SecteurService)
  private messageSnacbar=inject(NotificationService)


  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      secteur: ['', Validators.required],
      quota: ['',Validators.required],
      description: ['',Validators.required]
    });

    this.secteurService.getSecteurs().subscribe({
         next:(donnees)=>{
              this.listeSecteurs.set(donnees)
         },
         error:(erreur)=>{
           console.log(erreur)
         }
         
    })
  }

  fermerModale(): void {
    this.fermerClic.emit(false);
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

  soumettreProjet(): void {
    this.projectForm.markAllAsTouched();
    if (this.projectForm.invalid) {
      return;
    }

    this.chargement = true;
    if (this.fichierPitch) {
      this.supabaseService.uploadPitchFile(this.fichierPitch).subscribe({
        next: (urlPublique: string) => {
          this.envoyerProjetAuBackend(urlPublique);
        },
        error: (err) => {
          this.chargement = false;
          console.error("Erreur lors de l'upload du fichier chez Supabase :", err);
          //alert("Échec de l'enregistrement du fichier de pitch.");
          this.messageSnacbar.erreur("Échec de l'enregistrement du fichier de pitch.")
        }
      });
    } 
    else {
      this.envoyerProjetAuBackend('');
    }
  }

  private envoyerProjetAuBackend(urlDuPitch: string): void {
    const requete: ProjetRequest = {
      titre: this.projectForm.value.nom,
      description: this.projectForm.value.description || '',
      pith_url: urlDuPitch,
      quota_propose: this.projectForm.value.quota || '',
      secteur_id: parseInt(this.projectForm.value.secteur, 10) 
    };

    this.projetService.ajouterProjet(requete).subscribe({
      next: (reponse) => {
        this.chargement = false;
        //console.log('Projet enregistré avec succès dans la base de données Spring Boot !', reponse);
        //this.messageSnacbar.succes("Projet enregistré avec succès dans la base de données")
        this.ajoutReussiMisAjourClic.emit(); 
        //this.fermerModale();     
      },
      error: (err) => {
        this.chargement = false;
        console.error('Échec de la communication avec l\'API Spring Boot :', err);
        //alert("Erreur lors de l'initialisation du dossier de projet.");
        this.messageSnacbar.erreur("Erreur lors de l'initialisation du dossier de projet")
      }
    });
  }
}
