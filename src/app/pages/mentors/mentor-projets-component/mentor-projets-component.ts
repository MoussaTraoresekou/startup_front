import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LivrableDetailModalComponent } from '../livrableDetail/livrable-detail-modal-component/livrable-detail-modal-component';
import { MentorServices } from '../../../core/services/mentor/mentor-services';
import { PoteurService } from '../../../core/services/porteur/poteur-service';
import { ProjetDetailDto } from '../../../core/model/ProjetDetailDto';
import { ProjetEtapeResponseDto } from '../../../core/model/ProjetEtapeResponseDto';
import { LivrableEtapeDto } from '../../../core/model/LivrableEtapeDto';


@Component({
  selector: 'app-mentor-projets',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, LivrableDetailModalComponent],
  templateUrl: './mentor-projets-component.html',
  styleUrl: './mentor-projets-component.css'
})
export class MentorProjetsComponent implements OnInit {
  private mentorService = inject(MentorServices);

  startupsAssignees = signal<ProjetDetailDto[]>([]);
  startupSelectionneeId = signal<number | null>(null);
  etapes = signal<ProjetEtapeResponseDto[]>([]);
  
  projetEtapeIdActif = signal<number | null>(null);
  livrableSelectionne = signal<LivrableEtapeDto | null>(null);
  chargementLivrable = signal<boolean>(false);

  ngOnInit(): void {
    this.chargerStartupsDuMentor();
  }

  public chargerStartupsDuMentor(): void {
    this.mentorService.getMesStartupsAssignees().subscribe({
      next: (donneesReelles) => {
        this.startupsAssignees.set(donneesReelles);
      },
      error: (err) => console.error("Erreur d'extraction des startups réelles :", err)
    });
  }

  public selectionnerStartup(projetId: number): void {
    this.startupSelectionneeId.set(projetId);
    this.etapes.set([]); // Réinitialise la liste le temps du chargement réseau
    
    this.mentorService.getEtapesProjet(projetId).subscribe({
      next: (etapesReelles: ProjetEtapeResponseDto[]) => {
        this.etapes.set(etapesReelles);
      },
      error: (err) => console.error("Erreur d'extraction des étapes réelles :", err)
    });
  }

  public inspecterLivrableVirtuel(projetEtapeId: number): void {
    if (this.chargementLivrable()) return;
    this.chargementLivrable.set(true);

    this.mentorService.obtenirLivrableVirtuel(projetEtapeId).subscribe({
      next: (reponseLivrable) => {
        this.chargementLivrable.set(false);
        this.projetEtapeIdActif.set(projetEtapeId);
        this.livrableSelectionne.set(reponseLivrable);
      },
      error: (err) => {
        this.chargementLivrable.set(false);
        console.error("Échec d'acquisition du livrable virtuel :", err);
      }
    });
  }

  public fermerLiseuseLivrable(): void {
    this.projetEtapeIdActif.set(null);
    this.livrableSelectionne.set(null);
  }

  public rafraichirApresAction(): void {
    if (this.startupSelectionneeId()) {
      this.selectionnerStartup(this.startupSelectionneeId()!);
    }
  }
}
