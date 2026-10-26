
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MentorResponseDto } from '../../model/MentorResponseDto';
import { ProjetDetailDto } from '../../model/ProjetDetailDto';
import { Observable } from 'rxjs';
import { LivrableEtapeDto } from '../../model/LivrableEtapeDto';
import { ProjetEtapeResponseDto } from '../../model/ProjetEtapeResponseDto';

@Injectable({
  providedIn: 'root',
})
export class MentorServices {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/mentor';

  // Inscription du mentor avec CV et diplôme envoyés à Spring Boot
  registerMentor(formData: FormData): Observable<MentorResponseDto> {
    return this.http.post<MentorResponseDto>(
      `${this.baseUrl}/register`,
      formData
    );
  }

  getAllDemandAcccompagnement() {
    return this.http.get<DemandeAccompagnement[]>(
      `${this.baseUrl}/demandes`
    );
  }

  getInfoProjet(id: number) {
    return this.http.get<ProjetDetailDto>(
      `${this.baseUrl}/projet/${id}`
    );
  }

  accepetAcompagnement(id: number) {
    return this.http.put<{ message: string }>(
      `${this.baseUrl}/mentor-projets/${id}/accepter`,
      id
    );
  }

  refuserAcompagnement(id: number) {
    return this.http.put<{ message: string }>(
      `${this.baseUrl}/mentor-projets/${id}/refuser`,
      id
    );
  }

  /**
   * MENTOR : Consulter la synthèse virtuelle des questions/réponses en JSON
   */
  public obtenirLivrableVirtuel(
    projetEtapeId: number
  ): Observable<LivrableEtapeDto> {
    return this.http.get<LivrableEtapeDto>(
      `${this.baseUrl}/projet-etapes/${projetEtapeId}/consulter-livrable`
    );
  }

  /**
   * MENTOR : Valider l'étape avec un commentaire d'évaluation
   */
  public validerEtapeParMentor(dto: {
    projetEtapeId: number;
    commentaireMentor: string;
  }): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/projet-etapes/valider`,
      dto,
      { responseType: 'text' }
    );
  }

  /**
   * MENTOR : Renvoyer l'étape pour modification avec une note de cadrage
   */
  public renvoyerPourCorrection(dto: {
    projetEtapeId: number;
    commentaireMentor: string;
  }): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/projet-etapes/renvoyer-correction`,
      dto,
      { responseType: 'text' }
    );
  }

  /**
   * Récupérer les startups assignées au mentor
   */
  public getMesStartupsAssignees(): Observable<ProjetDetailDto[]> {
    return this.http.get<ProjetDetailDto[]>(
      `${this.baseUrl}/mes-startups`
    );
  }

  public getEtapesProjet(
    projetId: number
  ): Observable<ProjetEtapeResponseDto[]> {
    return this.http.get<ProjetEtapeResponseDto[]>(
      `${this.baseUrl}/projets/${projetId}/etapes`
    );
  }
  
  /**
   * Extraire le nom du fichier et charger le document PDF
   * depuis l'endpoint sécurisé du mentor.
   */
  consulterDocumentDepuisUrl(pithUrl: string) {
    const nomFichier = pithUrl.split(/[\\/]/).pop()!.split('?')[0];

    return this.consulterDocument(nomFichier);
  }

  consulterDocument(nomFichier: string) {
    return this.http.get(
      `${this.baseUrl}/documents/${encodeURIComponent(nomFichier)}`,
      { responseType: 'blob' }
    );
  }

}
