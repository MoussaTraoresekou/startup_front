import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjetFormAdd } from './projet-form-add/projet-form-add';
import { ProjetFormEdit } from './projet-form-edit/projet-form-edit';
import { ProjetCard } from './projet-card/projet-card';
import { BarreRecherche } from './barre-recherche/barre-recherche';
import { FiltreSecteur } from './filtre-secteur/filtre-secteur';
import { ProjetService } from '../../../core/services/projet-service';
import { ProjetResponse } from '../../../core/model/ProjetResponse';
import { OffresResponseDto } from '../../../core/model/OffresResponseDto';
import { NotificationService } from '../../../core/services/notification-service';

@Component({
  selector: 'app-mes-projets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, ProjetFormAdd, ProjetCard],
  templateUrl: './mes-projets.html',
  styleUrl: './mes-projets.css'
})
export class MesProjets implements OnInit {
  private projetService = inject(ProjetService);
  private http = inject(HttpClient);
    // À ajouter à côté de votre signal projets = signal<...>([]);
  disponible = signal<boolean>(true);

  messageSnackBar = inject(NotificationService);

  projets = signal<ProjetResponse[]>([]);
  offresEcosysteme = signal<OffresResponseDto[]>([]);
  offreSelectionnee = signal<OffresResponseDto | null>(null);
  
  motivationTexte: string = '';
  formulaireVisible = false;
  chargementPostuler = false;

  ngOnInit(): void {
    this.chargerProjet("", "");
    this.chargerOffresDeLEcosysteme();
  }

  public chargerProjet(secteur: string, titre: string): void {
    this.projetService.getProjetsDuPorteur().subscribe({
      next: (response) => {
        if (secteur === "" || titre === "") {
          this.projets.set(response);
        } else {
          this.projets.set(response.filter((projet) =>
            projet.secteur.toLowerCase().includes(secteur.toLowerCase()) || 
            projet.secteur.toLowerCase().includes(titre.toLowerCase())
          ));
        }
      }
    });
  }

  public chargerOffresDeLEcosysteme(): void {
    this.http.get<OffresResponseDto[]>('http://localhost:8080/api/porteur/offres/ecosysteme').subscribe({
      next: (donnees) => this.offresEcosysteme.set(donnees),
      error: (err) => console.error(err)
    });
  }

  public ouvrirLiseuseOffre(offre: OffresResponseDto): void {
    this.offreSelectionnee.set(offre);
    this.motivationTexte = '';
  }

  public fermerLiseuseOffre(): void {
    this.offreSelectionnee.set(null);
    this.motivationTexte = '';
  }

  public soumettreCandidature(): void {
    const offreActive = this.offreSelectionnee();
    if (!offreActive || !this.motivationTexte.trim() || this.chargementPostuler) return;
    this.chargementPostuler = true;

    const payload = { motivation: this.motivationTexte, offresId: offreActive.id };

    this.http.post('http://localhost:8080/api/porteur/offres/postuler', payload).subscribe({
      next: () => {
        this.chargementPostuler = false;
        this.messageSnackBar.succes(`Candidature pour "${offreActive.titre}" transmise.`);
        this.fermerLiseuseOffre();
        this.chargerOffresDeLEcosysteme();
      },
      error: (err) => { this.chargementPostuler = false; console.error(err); }
    });
  }

  public creerProjet(): void { this.formulaireVisible = true; }
  public fermerModal(val: boolean): void { this.formulaireVisible = val; }
  public AjoutEffectuer(): void { this.formulaireVisible = false; this.chargerProjet("", ""); }
}
