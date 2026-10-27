import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { NotificationService } from '../../../core/services/notification-service';
import { MembreEquipeDto } from '../../../core/model/MembreEquipeDto';
import { CandidatureRecueDto } from '../../../core/model/CandidatureRecueDto';
import { PoteurService } from '../../../core/services/porteur/poteur-service';
import { OffresRequestDto } from '../../../core/model/OffresRequestDto';
import { SpecialiteService } from '../../../core/services/specialite/specialite-service';
import { SpecialiteResponse } from '../../../core/model/specialiteResponse';
import { AccueilPorteurDto } from '../../../core/model/acceuiformentor';

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [
    CommonModule,
    SlicePipe,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './equipe-component.html',
  styleUrl: './equipe-component.css'
})
export class EquipeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private messageSnackBar = inject(NotificationService);
  private porteurService = inject(PoteurService);
  private specialiteService = inject(SpecialiteService);
  acceilAfiche = signal<AccueilPorteurDto | null>(null);


  projetId!: number;

  appelForm!: FormGroup;

  afficherFormulaireAppel = signal(false);
  afficherModalListeMembres = signal(false);
  chargementPublication = signal(false);
  chargementEquipe = signal(false);
  chargementCandidatures = signal(false);

  listeSpecialites = signal<SpecialiteResponse[]>([]);

  membres = signal<MembreEquipeDto[]>([]);
  candidatures = signal<CandidatureRecueDto[]>([]);
  offreSelectionnee = signal<CandidatureRecueDto | null>(null);

  ngOnInit(): void {
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    this.projetId = Number(idParam ?? 0);

    this.appelForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      profilRecherche: ['', [Validators.required, Validators.minLength(5)]],
      specialite: [null, Validators.required]
    });

    if (!this.projetId) {
      this.messageSnackBar.erreur('Identifiant du projet introuvable.');
      return;
    }

    this.recupererEquipeEtCandidatures();
    this.recupererSpecialites();
    this.porteurService.getAcceuilInfo().subscribe({
         next:(donnee)=>{
                  this.acceilAfiche.set(donnee)
         },
         error:(erreur)=>{

         }
    })
  }

  private recupererSpecialites(): void {
    this.specialiteService.getSpecialite().subscribe({
      next: (donnees) => {
        this.listeSpecialites.set(donnees);
      },
      error: (erreur) => {
        const message =
          erreur.error?.message ??
          'Une erreur est survenue lors de la récupération des spécialités.';

        this.messageSnackBar.erreur(message);
      }
    });
  }

  public recupererEquipeEtCandidatures(): void {
    this.chargementEquipe.set(true);
    this.chargementCandidatures.set(true);

    this.porteurService.getMesEquipes(this.projetId).subscribe({
      next: (donnees) => {
        this.membres.set(donnees);
        this.chargementEquipe.set(false);
      },
      error: (erreur) => {
        console.error('Erreur lors du chargement de l’équipe :', erreur);
        this.membres.set([]);
        this.chargementEquipe.set(false);
        this.messageSnackBar.erreur(
          'Impossible de récupérer les membres du projet.'
        );
      }
    });

    this.http
      .get<CandidatureRecueDto[]>(
        `http://localhost:8080/api/porteur/projets/${this.projetId}/candidatures-recues`
      )
      .subscribe({
        next: (donnees) => {
          this.candidatures.set(donnees);
          this.chargementCandidatures.set(false);

          if (donnees.length > 0 && !this.offreSelectionnee()) {
            this.offreSelectionnee.set(donnees[0]);
          }
        },
        error: (erreur) => {
          console.error('Erreur lors du chargement des candidatures :', erreur);
          this.candidatures.set([]);
          this.chargementCandidatures.set(false);
          this.messageSnackBar.erreur(
            'Impossible de récupérer les candidatures reçues.'
          );
        }
      });
  }

  public ouvrirLiseuseOffre(candidature: CandidatureRecueDto): void {
    this.offreSelectionnee.set(candidature);
  }

  public basculerVoletAppel(): void {
    this.afficherFormulaireAppel.update((visible) => !visible);
  }

  public basculerModalMembres(): void {
    this.afficherModalListeMembres.update((visible) => !visible);
  }

  public soumettreAppel(): void {
    if (this.appelForm.invalid || this.chargementPublication()) {
      this.appelForm.markAllAsTouched();
      return;
    }

    this.chargementPublication.set(true);

    const payload = {
      ...this.appelForm.value,
      projetId: this.projetId
    } as OffresRequestDto;

    this.porteurService.publierAppelCandidature(payload).subscribe({
      next: () => {
        this.chargementPublication.set(false);

        this.messageSnackBar.succes(
          'Votre appel à candidature a été publié avec succès.'
        );

        this.appelForm.reset();
        this.afficherFormulaireAppel.set(false);
        this.recupererEquipeEtCandidatures();
      },
      error: (erreur) => {
        const message =
          erreur.error?.message ??
          'Une erreur est survenue lors de la publication de l’appel.';

        this.messageSnackBar.erreur(message);
        this.chargementPublication.set(false);
      }
    });
  }

  public traiterArbitrageCandidature(
    id: number,
    decision: 'accepter' | 'refuser'
  ): void {
    const url = `http://localhost:8080/api/porteur/candidatures/${id}/${decision}`;

    this.http.put(url, {}).subscribe({
      next: () => {
        this.messageSnackBar.succes(
          decision === 'accepter'
            ? 'La candidature a été acceptée.'
            : 'La candidature a été refusée.'
        );

        this.offreSelectionnee.set(null);
        this.recupererEquipeEtCandidatures();
      },
      error: (erreur) => {
        console.error('Erreur lors du traitement de la candidature :', erreur);

        this.messageSnackBar.erreur(
          erreur.error?.message ??
          'Impossible de traiter cette candidature.'
        );
      }
    });
  }
}
