import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../core/services/notification-service';
import { CollaborateurService } from '../../../core/services/collaborateur/collaborateur-service';
import { CollaborateurRegisterRequestDto } from '../../../core/model/CollaborateurRegisterRequestDto';

@Component({
  selector: 'app-register-collaborateur',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './register-collaborateur.html',
  styleUrl: './register-collaborateur.css'
})
export class RegisterCollaborateurComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private messageSnackBar = inject(NotificationService);
  private collaborateurService=inject(CollaborateurService)

  registerForm!: FormGroup;
  hidePassword = true;
  chargement = signal<boolean>(false);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      
      // 🚀 SÉCURITÉ 1FN : Le pattern ^[a-zA-ZÀ-ÿ\s\-\/]+$ interdit strictement les virgules (,) et les points-virgules (;)
      specialite: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s\-\/]+$/)
      ]],
      
      biographie: ['', [Validators.maxLength(1000)]],
      lienPortfolio: ['', [Validators.pattern('https?://.+')]]
    });
  }


  public onSubmit(): void {
    if (this.registerForm.invalid || this.chargement()) return;
    this.chargement.set(true);

    this.collaborateurService.register_collaborateur(this.registerForm.value as CollaborateurRegisterRequestDto).subscribe({
      next: () => {
        this.chargement.set(false);
        this.messageSnackBar.succes("Votre compte collaborateur a été créé avec succès ! Connectez-vous pour rejoindre des équipes.");
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.chargement.set(false);
        console.error(err);
      }
    });
  }
}
