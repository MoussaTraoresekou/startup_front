import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../core/services/notification-service';
import { SupabaseService } from '../../../core/services/supabase/supabase-service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MentorServices } from '../../../core/services/mentor/mentor-services';
import { RegisterMentorRequest } from '../../../core/model/RegisterMentorRequest ';
import { MentorResponseDto } from '../../../core/model/MentorResponseDto';

@Component({
  selector: 'app-register-mentor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './mentor-register.html',
  styleUrls: ['./mentor-register.css']
})
export class MentorRegister {
  private fb = inject(FormBuilder);
  private mentorService = inject(MentorServices);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  message = inject(NotificationService);

  registerForm: FormGroup;
  hidePassword = true;
  chargement = false;

  // Objets de fichiers machine pour le suivi visuel HTML
  fichierCV: File | null = null;
  fichierDiplome: File | null = null;

  // Indicateurs de progression pour le stockage Cloud Supabase
  chargementCV = false;
  chargementDiplome = false;

  constructor() {
    this.registerForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      motDePass: ['', [Validators.required, Validators.minLength(6)]],
      telephone: ['', [Validators.required]],
      cvUrl: ['', [Validators.required]],      
      diplomeUrl: ['', [Validators.required]], 
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  /**
   * Intercepte le document PDF local et le pousse instantanément vers le bucket cloud Supabase ☁️
   */
  public onFileSelected(event: any, typeDocument: 'cvUrl' | 'diplomeUrl'): void {
    const inputFiles = event.target.files;
    
    if (!inputFiles || inputFiles.length === 0) return;

    const fileSelected: File = inputFiles[0];

    // Sécurité : Validation stricte de l'extension binaire exigée
    if (fileSelected.type !== 'application/pdf') {
      this.message.erreur("Seul le format de document PDF est accepté.");
      return;
    }

    if (typeDocument === 'cvUrl') {
      this.chargementCV = true;
      this.fichierCV = fileSelected;
      
      this.supabaseService.uploadPitchFile(fileSelected).subscribe({
        next: (urlPublique: string) => {
          this.registerForm.get('cvUrl')?.setValue(urlPublique);
          this.chargementCV = false;
          this.message.succes("Curriculum Vitae chargé avec succès !");
        },
        error: (err) => {
          this.chargementCV = false;
          this.fichierCV = null;
          this.registerForm.get('cvUrl')?.setValue('');
          this.message.erreur("Échec de l'envoi du CV vers le serveur cloud.");
          console.error(err);
        }
      });
    } else {
      this.chargementDiplome = true;
      this.fichierDiplome = fileSelected;

      this.supabaseService.uploadPitchFile(fileSelected).subscribe({
        next: (urlPublique: string) => {
          this.registerForm.get('diplomeUrl')?.setValue(urlPublique);
          this.chargementDiplome = false;
          this.message.succes("Diplôme chargé avec succès !");
        },
        error: (err) => {
          this.chargementDiplome = false;
          this.fichierDiplome = null;
          this.registerForm.get('diplomeUrl')?.setValue('');
          this.message.erreur("Échec de l'envoi du diplôme.");
          console.error(err);
        }
      });
    }
  }

  /**
   * Vide localement le fichier sélectionné en cas d'annulation
   */
  public supprimerFichier(event: Event, typeDocument: 'cvUrl' | 'diplomeUrl'): void {
    event.preventDefault();
    event.stopPropagation();

    if (typeDocument === 'cvUrl') {
      this.fichierCV = null;
      this.registerForm.get('cvUrl')?.setValue('');
    } else {
      this.fichierDiplome = null;
      this.registerForm.get('diplomeUrl')?.setValue('');
    }
  }

  /**
   * Valide le formulaire global et transmet l'objet DTO finalisé à Spring Boot 🚀
   */
  public onSubmit(): void {
    if (this.registerForm.valid && !this.chargement) {
      this.chargement = true;

      const payload = this.registerForm.value as RegisterMentorRequest;

      // Consommation de votre service dédié MentorServices
      this.mentorService.registerMentor(payload).subscribe({
        next: (response: MentorResponseDto) => {
          this.chargement = false;
          this.message.succes("Votre candidature a été soumise avec succès ! Elle est en cours d'analyse.");
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.chargement = false;
          this.message.erreur(error.error?.message || "Une erreur est survenue lors de l'enregistrement de votre profil.");
          console.error(error);
        }
      });
    }
  }
}
