import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../core/services/notification-service';
import { OffresResponseDto } from '../../../core/model/OffresResponseDto';

@Component({
  selector: 'app-offres',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './offre.html',
  styleUrl: './offre.css'
})
export class OffresComponent implements OnInit {
  private http = inject(HttpClient);
  private messageSnackBar = inject(NotificationService);

  listeAnnonces = signal<OffresResponseDto[]>([]);
  offreSelectionnee = signal<OffresResponseDto | null>(null);
  
  motivationTexte: string = '';
  chargement = signal<boolean>(false);
  chargementPostuler = signal<boolean>(false);

  ngOnInit(): void {
    this.chargerOffresOuvertes();
  }

  public chargerOffresOuvertes(): void {
    this.chargement.set(true);
    this.http.get<OffresResponseDto[]>('http://localhost:8080/api/collaborateur/offres/ouvertes').subscribe({
      next: (donnees) => {
        this.listeAnnonces.set(donnees);
        this.chargement.set(false);
      },
      error: (err) => {
        this.chargement.set(false);
        console.error(err);
      }
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
    if (!offreActive || !this.motivationTexte.trim() || this.chargementPostuler()) return;

    this.chargementPostuler.set(true);

    const payload = {
      motivation: this.motivationTexte,
      offresId: offreActive.id
    };

    this.http.post('http://localhost:8080/api/collaborateur/offres/postuler', payload).subscribe({
      next: () => {
        this.chargementPostuler.set(false);
        this.messageSnackBar.succes(`Votre candidature pour le poste de "${offreActive.titre}" a été transmise au porteur.`);
        this.fermerLiseuseOffre();
      },
      error: (err) => {
        this.chargementPostuler.set(false);
        console.error(err);
      }
    });
  }
}
