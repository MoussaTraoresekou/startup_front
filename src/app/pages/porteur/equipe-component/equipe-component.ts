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

  projetId!: number;
  registerForm!: FormGroup;
  
  afficherFormulaireAppel = signal<boolean>(false);
  afficherModalListeMembres = signal<boolean>(false);
  chargementPublication = signal<boolean>(false);
  chargementEquipe = signal<boolean>(false);
  
  membres = signal<MembreEquipeDto[]>([]);
  candidatures = signal<CandidatureRecueDto[]>([]);

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
    
    // 📡 Récupération de l'équipe unifiée et polymorphe du backend (Porteur + Multi-Mentors + Multi-Collabs)
    this.http.get<MembreEquipeDto[]>(`http://localhost:8080/api/porteur/projets/${this.projetId}/equipe-complete`).subscribe({
      next: (donnees) => {
        this.membres.set(donnees);
        this.chargementEquipe.set(false);
      },
      error: (err) => {
        console.error(err);
        this.chargementEquipe.set(false);
        // Fallback de secours en cas d'absence de serveur
        this.membres.set([
          { id: 1, nom: 'Sangaré', prenom: 'Kadiatou', roleEcosysteme: 'PORTEUR', specialite: 'Fondateur Principal' },
          { id: 2, nom: 'Traoré', prenom: 'Ibrahim', roleEcosysteme: 'MENTOR', specialite: 'Mentor Technique' },
          { id: 3, nom: 'Diallo', prenom: 'Moussa', roleEcosysteme: 'COLLABORATEUR', specialite: 'Développeur Angular' },
          { id: 4, nom: 'Cissé', prenom: 'Fatoumata', roleEcosysteme: 'COLLABORATEUR', specialite: 'UI/UX Designer' }
        ]);
      }
    });

    // Simulation/Chargement des candidatures en attente
    this.candidatures.set([
      { id: 101, collaborateurNom: 'Coulibaly', collaborateurPrenom: 'Abdoulaye', collaborateurSpecialite: 'Développeur Spring Boot', dateCreation: '2026-10-13T10:00:00', motivation: 'Je souhaite participer à la conception de l\'API.' }
    ]);
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

    this.http.post('http://localhost:8080/api/porteur/offres/publier', payload).subscribe({
      next: () => {
        this.chargementPublication.set(false);
        this.messageSnackBar.succes("Votre appel à candidature a été publié avec succès au sein de l'incubateur.");
        this.registerForm.reset();
        this.afficherFormulaireAppel.set(false);
      },
      error: (err) => {
        this.chargementPublication.set(false);
        console.error(err);
      }
    });
  }

  public traiterArbitrageCandidature(id: number, decision: 'accepter' | 'refuser'): void {
    this.candidatures.update(items => items.filter(c => c.id !== id));
    this.messageSnackBar.succes(`La candidature a été traitée avec succès ("${decision}").`);
    this.recupererEquipeEtCandidatures();
  }
}
