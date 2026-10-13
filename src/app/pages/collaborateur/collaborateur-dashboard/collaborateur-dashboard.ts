import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface StatatistiquesCollaborateurDto {
  projetsActifsCount: number;
  candidaturesEnAttenteCount: number;
  invitationsRecuesCount: number;
}

interface AppelCandidatureFictifDto {
  id: number;
  titreRole: string;
  projetTitre: string;
}

@Component({
  selector: 'app-collaborateur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './collaborateur-dashboard.html',
  styleUrl: './collaborateur-dashboard.css'
})
export class CollaborateurDashboardComponent implements OnInit {

  stats = signal<StatatistiquesCollaborateurDto>({
    projetsActifsCount: 2,
    candidaturesEnAttenteCount: 1,
    invitationsRecuesCount: 3
  });
  
  dernieresOffres = signal<AppelCandidatureFictifDto[]>([]);

  ngOnInit(): void {
    this.injecterDonneesFictives();
  }

  private injecterDonneesFictives(): void {
    const simulationAnnonces: AppelCandidatureFictifDto[] = [
      {
        id: 1,
        titreRole: 'Développeur Mobile Angular / Ionic',
        projetTitre: 'Waati Delivery'
      },
      {
        id: 2,
        titreRole: 'UI/UX Designer — Maquettes Web/Mobile',
        projetTitre: 'Sini Sané Health'
      },
      {
        id: 3,
        titreRole: 'Expert Marketing Digital & Growth Hacking',
        projetTitre: 'Mali AgriTech'
      }
    ];

    this.dernieresOffres.set(simulationAnnonces);
  }
}
