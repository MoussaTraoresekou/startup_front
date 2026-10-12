import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RegisterMentorRequest } from '../../model/RegisterMentorRequest ';
import { MentorResponseDto } from '../../model/MentorResponseDto';
import { ProjetDetailDto } from '../../model/ProjetDetailDto';
import { Observable } from 'rxjs';
import { LivrableEtapeDto } from '../../model/LivrableEtapeDto';

@Injectable({
  providedIn: 'root',
})
export class MentorServices {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api/mentor';
  registerMentor(mentor: RegisterMentorRequest){
    return this.http.post<MentorResponseDto>(`${this.baseUrl}/register`,mentor)
  }
  getAllDemandAcccompagnement(){
     return this.http.get<DemandeAccompagnement[]>(`${this.baseUrl}/demandes`)

  }
  getInfoProjet(id:number){
    return  this.http.get<ProjetDetailDto>(`${this.baseUrl}/projet/${id}`)
  }

  accepetAcompagnement(id:number){
       return this.http.put<{message:string}>(`${this.baseUrl}/mentor-projets/${id}/accepter`,id);
  }
  refuserAcompagnement(id:number){
       return this.http.put<{message:string}>(`${this.baseUrl}/mentor-projets/${id}/refuser`,id);
  }
   /**
   * 🔍 MENTOR : Consulter la synthèse virtuelle des questions/réponses en JSON
   */
  public obtenirLivrableVirtuel(projetEtapeId: number): Observable<LivrableEtapeDto> {
    return this.http.get<LivrableEtapeDto>(`${this.baseUrl}/projet-etapes/${projetEtapeId}/consulter-livrable`);
  }

  /**
   *  MENTOR : Valider l'étape avec un commentaire d'évaluation
   */
  public validerEtapeParMentor(dto: { projetEtapeId: number; commentaireMentor: string }): Observable<string> {
    return this.http.put(`${this.baseUrl}/projet-etapes/valider`, dto, { responseType: 'text' });
  }

  /**
   *  MENTOR : Renvoyer l'étape pour modification avec une note de cadrage
   */
  public renvoyerPourCorrection(dto: { projetEtapeId: number; commentaireMentor: string }): Observable<string> {
    return this.http.put(`${this.baseUrl}/projet-etapes/renvoyer-correction`, dto, { responseType: 'text' });
  }
    /**
   *  REAL DATA : Récupère la liste réelle des startups assignées au mentor
   */
  public getMesStartupsAssignees(): Observable<ProjetDetailDto[]> {
    return this.http.get<ProjetDetailDto[]>(`${this.baseUrl}/mes-startups`);
  }

}
