import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { DashboardPorteur } from '../../../core/model/dashboard-porteur';
import { PoteurService } from '../../../core/services/porteur/poteur-service';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  // Données reçues du backend
  dasbordPorteur = signal<DashboardPorteur | null>(null);

  // États de chargement et d'erreur
  chargement = signal<boolean>(true);
  erreur = signal<string | null>(null);

  private readonly porteurService = inject(PoteurService);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);


  projetId = 0;

  constructor() {
    // Récupération de l'identifiant dans la route
    const idParam =
      this.route.parent?.snapshot.paramMap.get('id')
      ?? this.route.snapshot.paramMap.get('id');

    const id = Number(idParam);

    if (!idParam || !Number.isInteger(id) || id <= 0) {
      this.erreur.set(
        'Impossible de récupérer l’identifiant du projet.'
      );
      this.chargement.set(false);
      return;
    }

    this.projetId = id;

    this.chargerDashboard();
  }

  private chargerDashboard(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.porteurService
      .obtenirDashboard(this.projetId)
      .subscribe({
        next: (donnee: DashboardPorteur) => {
          this.dasbordPorteur.set(donnee);
          this.chargement.set(false);
        },

        error: (err) => {
          console.error(
            'Erreur lors du chargement du dashboard :',
            err
          );

          this.erreur.set(
            err.status === 401
              ? 'Votre session a expiré. Veuillez vous reconnecter.'
              : err.status === 403
                ? 'Vous n’êtes pas autorisé à consulter ce projet.'
                : 'Impossible de charger les informations du projet.'
          );

          this.chargement.set(false);
        }
      });
  }
}