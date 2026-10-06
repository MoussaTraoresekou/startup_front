import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjetService } from '../../core/services/projet-service';
import { ProjetResponse } from '../../core/model/ProjetResponse';

interface ProjetAffichage {
  id: number;
  titre: string;
  secteur: string;
  etape: string;
  progression: number;
  statut: string;
  statutClasse: string;
}

@Component({
  selector: 'app-mes-projets',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './mes-projets.html',
  styleUrl: './mes-projets.css'
})
export class MesProjets implements OnInit {
  
  private projetService = inject(ProjetService); // Injection de votre service Backend
  private router = inject(Router);

  // Le tableau qui alimente votre HTML avec la boucle *ngFor
  projets: ProjetAffichage[] = [];

  ngOnInit(): void {
    this.chargerProjetsDuServeur();
  }

  /**
   * Émet l'appel HTTP vers Spring Boot et transforme le résultat pour votre HTML 📡
   */
  chargerProjetsDuServeur(): void {
    this.projetService.getProjetsDuPorteur().subscribe({
      next: (donneesBdd: ProjetResponse[]) => {
        // Transformation (mapping) des données brutes en objets lisibles par votre interface
        this.projets = donneesBdd.map(p => ({
          id: p.id,
          titre: p.titre,
          secteur: p.secteur,
          // Données par défaut ou simulées en attendant que vos tables étapes soient raccordées
          etape: 'Idéation',
          progression: 25,
          statut: 'En cours',
          statutClasse: 'success'
        }));
      },
      error: (err) => {
        console.error("Impossible de charger vos projets depuis l'API Backend :", err);
      }
    });
  }

  /**
   * Ouvre l'espace projet complet sous la forme dynamique /porteur/projets/:id/dashboard
   */
  ouvrirProjet(projet: ProjetAffichage) {
    localStorage.setItem('activeProjetId', projet.id.toString());
    localStorage.setItem('activeProjetNom', projet.titre);
    
    // Redirection automatique vers votre routeur maître
    this.router.navigate(['/porteur/projets', projet.id, 'dashboard']);
  }

  creerProjet() {
    this.router.navigate(['/porteur/profil']);
  }
}
