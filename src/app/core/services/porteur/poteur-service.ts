import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MentorResponseDto } from '../../model/MentorResponseDto';
import { InvitationMentorDto } from '../../model/InvitationMentorDto';
import { ProjetEtapeResponseDto } from '../../model/ProjetEtapeResponseDto';
import { RegisterPorteurRequestDto } from '../../model/RegisterPorteurRequestDto';
import { PorteurResponseDto } from '../../model/PorteurResponseDto';
import { MembreEquipeDto } from '../../model/MembreEquipeDto';
import { OffresResponseDto } from '../../model/OffresResponseDto';
import { OffresRequestDto } from '../../model/OffresRequestDto';
import { AccueilPorteurDto } from '../../model/acceuiformentor';
import { DashboardPorteur } from '../../model/dashboard-porteur';
import { Tache } from '../../model/tache';

@Injectable({
  providedIn: 'root',
})
export class PoteurService {

  private readonly http = inject(HttpClient);

  // URL des endpoints propres au porteur
  private readonly baseUrl = 'http://localhost:8080/api/porteur';

  // URL racine des endpoints du backend
  private readonly apiUrl = 'http://localhost:8080/api';

  // ==================== MENTORS ====================

  getAllMentor(): Observable<MentorResponseDto[]> {
    return this.http.get<MentorResponseDto[]>(
      `${this.baseUrl}/mentors`
    );
  }

  solliciterMentor(
    invitation: InvitationMentorDto
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/solliciter-mentor`,
      invitation
    );
  }

  // ==================== ÉTAPES DU PROJET ====================

  soumettreEtape(
    projetEtapeId: number
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.baseUrl}/projet-etapes/${projetEtapeId}/soumettre`,
      {}
    );
  }

  getEtapesProjet(
    projetId: number
  ): Observable<ProjetEtapeResponseDto[]> {
    return this.http.get<ProjetEtapeResponseDto[]>(
      `${this.baseUrl}/projets/${projetId}/etapes`
    );
  }

  // ==================== PROFIL PORTEUR ====================

  registerPorteur(
    porteur: RegisterPorteurRequestDto
  ): Observable<PorteurResponseDto> {
    return this.http.post<PorteurResponseDto>(
      `${this.baseUrl}/register`,
      porteur
    );
  }

  // ==================== ÉQUIPE ====================

  getMesEquipes(
    projet_id: number
  ): Observable<MembreEquipeDto[]> {
    return this.http.get<MembreEquipeDto[]>(
      `${this.baseUrl}/projets/${projet_id}/equipe-complete`
    );
  }

  // ==================== APPELS À CANDIDATURE ====================

  publierAppelCandidature(
    offre: OffresRequestDto
  ): Observable<OffresResponseDto> {
    return this.http.post<OffresResponseDto>(
      `${this.baseUrl}/offres/publier`,
      offre
    );
  }

  // ==================== ACCUEIL ====================

  getAcceuilInfo(): Observable<AccueilPorteurDto> {
    return this.http.get<AccueilPorteurDto>(
      `${this.baseUrl}/acceil_info`
    );
  }

  // ==================== TABLEAU DE BORD ====================

  obtenirDashboard(
    projetId: number
  ): Observable<DashboardPorteur> {
    return this.http.get<DashboardPorteur>(
      `${this.baseUrl}/projets/${projetId}/dashboard`
    );
  }

  // ==================== MES TÂCHES ====================

  obtenirmesTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(
      `${this.baseUrl}/mes-taches`
    );
  }

  // ==================== SOUMISSION D'UN RENDU ====================

  soumettreRendu(
    tacheId: number,
    renduDescription: string,
    fichier: File
  ): Observable<Tache> {

    const formulaire = new FormData();

    formulaire.append('renduDescription', renduDescription);
    formulaire.append('fichier', fichier, fichier.name);

    return this.http.put<Tache>(
      `${this.apiUrl}/taches/${tacheId}/soumettre`,
      formulaire
    );
  }

  // ==================== CONSULTATION D'UN RENDU ====================

  obtenirFichierRendu(
    nomFichier: string
  ): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/fichiers/rendu/${encodeURIComponent(nomFichier)}`,
      {
        responseType: 'blob',
      }
    );
  }
}