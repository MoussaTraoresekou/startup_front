
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { TacheCreation } from '../../model/tache-creation';
import { Tache } from '../../model/tache';
import { TacheRendu } from '../../model/tache-rendu';
import { TacheVerification } from '../../model/tache-verification';

@Injectable({
  providedIn: 'root',
})
export class TacheService {
  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:8080/api/taches';

  /**
   * Créer une tâche pour un projet.
   */
  creerTache(
    projetId: number,
    dto: TacheCreation
  ): Observable<Tache> {
    return this.http.post<Tache>(
      `${this.baseUrl}/projets/${projetId}`,
      dto
    );
  }

  /**
   * Récupérer toutes les tâches d'un projet.
   */
  obtenirTachesProjet(
    projetId: number
  ): Observable<Tache[]> {
    return this.http.get<Tache[]>(
      `${this.baseUrl}/projets/${projetId}`
    );
  }

  /**
   * Soumettre le rendu d'une tâche.
   */
  soumettreRendu(
    tacheId: number,
    dto: TacheRendu
  ): Observable<Tache> {
    return this.http.put<Tache>(
      `${this.baseUrl}/${tacheId}/soumettre`,
      dto
    );
  }

  /**
   * Vérifier le rendu d'une tâche.
   */
  verifierRendu(
    tacheId: number,
    dto: TacheVerification
  ): Observable<Tache> {
    return this.http.put<Tache>(
      `${this.baseUrl}/${tacheId}/verifier`,
      dto
    );
  }
}
