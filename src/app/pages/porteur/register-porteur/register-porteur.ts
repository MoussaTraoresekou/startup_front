import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../core/services/notification-service';
import { PoteurService } from '../../../core/services/porteur/poteur-service';
import { SpecialiteService } from '../../../core/services/specialite/specialite-service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-register-porteur',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './register-porteur.html',
  styleUrl: './register-porteur.css'
})
export class RegisterPorteur implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private porteurService = inject(PoteurService);
  private messageSnackBar = inject(NotificationService);
  private specialiteService = inject(SpecialiteService); 

  registerForm!: FormGroup;
  hidePassword = true;
  chargement = signal<boolean>(false);
  
  // Signal pour stocker la liste des spécialités de la BDD
  lesSpecialites = signal<any[]>([]);

  ngOnInit(): void {
    // 1. Définition de tous les champs du formulaire d'après le DTO
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      specialite_id: ['', [Validators.required]], // Requis
      biographie: [''], // Optionnel
      lienPortfolio: [''] // Optionnel
    });

    // 2. Chargement des spécialités depuis le backend au démarrage
    this.chargerSpecialites();
  }

  private chargerSpecialites(): void {
    this.specialiteService.getSpecialite().subscribe({
      next: (data) => this.lesSpecialites.set(data),
      error: (err) => console.error("Erreur lors de la récupération des spécialités :", err)
    });
  }

  public onSubmit(): void {
    if (this.registerForm.invalid || this.chargement()) return;
    this.chargement.set(true);

    this.porteurService.registerPorteur(this.registerForm.value).subscribe({
      next: () => {
        this.chargement.set(false);
        this.messageSnackBar.succes("Votre compte porteur a été créé avec succès ! Veuillez cliquer sur le lien qui vous a été envoyé par email.");
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.chargement.set(false);
        this.messageSnackBar.erreur("Échec de la création de compte. Veuillez réessayer.");
        console.error("Échec de la création de compte :", err);
      }
    });
  }
}
