import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../core/services/notification-service';
import { PoteurService } from '../../../core/services/porteur/poteur-service';

@Component({
  selector: 'app-register-porteur',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './register-porteur.html',
  styleUrl: './register-porteur.css'
})
export class RegisterPorteur implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private porteurService = inject(PoteurService);
  private messageSnackBar = inject(NotificationService);

  registerForm!: FormGroup;
  hidePassword = true;
  chargement = signal<boolean>(false);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  public onSubmit(): void {
    if (this.registerForm.invalid || this.chargement()) return;
    this.chargement.set(true);

    this.porteurService.registerPorteur(this.registerForm.value).subscribe({
      next: () => {
        this.chargement.set(false);
        this.messageSnackBar.succes("Votre compte porteur a été créé avec succès ! veuillez cliquer le lien qui vous été envoyé dans votre compte email");
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.chargement.set(false);
        console.error("Échec de la création de compte :", err);
      }
    });
  }
}
