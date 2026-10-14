import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../core/services/notification-service';
import { MembreEquipeDto } from '../../../core/model/MembreEquipeDto';
import { CandidatureRecueDto } from '../../../core/model/CandidatureRecueDto';
import { PoteurService } from '../../../core/services/porteur/poteur-service';
import { OffresRequestDto } from '../../../core/model/OffresRequestDto';

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './equipe-component.html',
  styleUrl: './equipe-component.css'
})
export class EquipeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private messageSnackBar = inject(NotificationService);
  private porteurService = inject(PoteurService);

  projetId!: number;
  registerForm!: FormGroup;
  
  afficherFormulaireAppel = signal<boolean>(false);
  afficherModalListeMembres = signal<boolean>(false);
  chargementPublication = signal<boolean>(false);
  chargementEquipe = signal<boolean>(false);
  chargementCandidatures = signal<boolean>(false);
  
  membres = signal<MembreEquipeDto[]>([]);
  candidatures = signal<CandidatureRecueDto[]>([]);
  offreSelectionnee = signal<CandidatureRecueDto | null>(null);

  ngOnInit(): void {
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    this.projetId = parseInt(idParam || '0', 10);

    this.registerForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      profilRecherche: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.recupererEquipeEtCandidatures();
  }

  public recupererEquipeEtCandidatures(): void {
    this.chargementEquipe.set(true);
    this.chargementCandidatures.set(true);
    
    this.porteurService.getMesEquipes(this.projetId).subscribe({
      next: (donnees) => {
        this.membres.set(donnees);
        this.chargementEquipe.set(false);
      },
      error: (err) => {
        console.error(err);
        this.chargementEquipe.set(false);
        this.membres.set([
          { id: 1, nom: 'Sangaré', prenom: 'Kadiatou', roleEcosysteme: 'PORTEUR', specialite: 'Fondateur Principal' },
          { id: 2, nom: 'Traoré', prenom: 'Ibrahim', roleEcosysteme: 'MENTOR', specialite: 'Mentor Technique' },
          { id: 3, nom: 'Diallo', prenom: 'Moussa', roleEcosysteme: 'COLLABORATEUR', specialite: 'Développeur Angular' }
        ]);
      }
    });

    this.http.get<CandidatureRecueDto[]>(`http://localhost:8080/api/porteur/projets/${this.projetId}/candidatures-recues`).subscribe({
      next: (donnees) => {
        this.candidatures.set(donnees);
        this.chargementCandidatures.set(false);
        if (donnees.length > 0 && !this.offreSelectionnee()) {
          this.offreSelectionnee.set(donnees[0]);
        }
      },
      error: (err) => {
        console.error(err);
        this.chargementCandidatures.set(false);
      }
    });
  }

  public ouvrirLiseuseOffre(candidature: CandidatureRecueDto): void {
    this.offreSelectionnee.set(candidature);
  }

  public basculerVoletAppel(): void {
    this.afficherFormulaireAppel.update(v => !v);
  }

  public basculerModalMembres(): void {
    this.afficherModalListeMembres.update(v => !v);
  }

  public onSubmitAppel(): void {
    if (this.registerForm.invalid || this.chargementPublication()) return;
    this.chargementPublication.set(true);

    const payload = {
      ...this.registerForm.value,
      projetId: this.projetId
    };

    this.porteurService.publierAppelCandidature(payload as OffresRequestDto).subscribe({
      next: () => {
        this.chargementPublication.set(false);
        this.messageSnackBar.succes("Votre appel à candidature a été publié avec succès au sein de l'incubateur.");
        this.registerForm.reset();
        this.afficherFormulaireAppel.set(false);
        this.recupererEquipeEtCandidatures();
      },
      error: (err) => {
        this.chargementPublication.set(false);
        console.error(err);
      }
    });
  }

  public traiterArbitrageCandidature(id: number, decision: 'accepter' | 'refuser'): void {
    const url = `http://localhost:8080/api/porteur/candidatures/${id}/${decision}`;
    
    this.http.put(url, {}).subscribe({
      next: () => {
        this.messageSnackBar.succes(`La candidature a été validée avec succès ("${decision}").`);
        this.offreSelectionnee.set(null);
        this.recupererEquipeEtCandidatures();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
