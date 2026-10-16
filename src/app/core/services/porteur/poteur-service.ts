import { inject, Injectable } from '@angular/core';
import { MentorResponseDto } from '../../model/MentorResponseDto';
import { HttpClient } from '@angular/common/http';
import { InvitationMentorDto } from '../../model/InvitationMentorDto';
import { Observable } from 'rxjs';
import { ProjetEtapeResponseDto } from '../../model/ProjetEtapeResponseDto';
import { RegisterPorteurRequestDto } from '../../model/RegisterPorteurRequestDto';
import { PorteurResponseDto } from '../../model/PorteurResponseDto';
import { MembreEquipeDto } from '../../model/MembreEquipeDto';
import { OffresResponseDto } from '../../model/OffresResponseDto';
import { OffresRequestDto } from '../../model/OffresRequestDto';

@Injectable({
  providedIn: 'root',
})
export class PoteurService {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api/porteur';
  getAllMentor(){
     return this.http.get<MentorResponseDto[]>(`${this.baseUrl}/mentors`);
  }
  solliciterMentor(invitation: InvitationMentorDto) {
    return this.http.post<{ message: string }>(`${this.baseUrl}/solliciter-mentor`, invitation);
  }
  
  public soumettreEtape(projetEtapeId: number) {
    return this.http.put<{message:string}>(`${this.baseUrl}/projet-etapes/${projetEtapeId}/soumettre`, {});
  }
    /**
   *  REAL DATA : Récupère la liste réelle des étapes associées à un projet précis
   */
  public getEtapesProjet(projetId: number): Observable<ProjetEtapeResponseDto[]> {
    return this.http.get<ProjetEtapeResponseDto[]>(`${this.baseUrl}/projets/${projetId}/etapes`);
  }
  
  registerPorteur(porteur:RegisterPorteurRequestDto){
    return this.http.post<PorteurResponseDto>(`${this.baseUrl}/register`,porteur);
  }
  getMesEquipes(projet_id:number){
          return this.http.get<MembreEquipeDto[]>(`${this.baseUrl}/projets/${projet_id}/equipe-complete`)
  }
  //http://localhost:8080/api/porteur/offres/publier
  publierAppelCandidature(offre:OffresRequestDto){
    return this.http.post<OffresResponseDto>(`${this.baseUrl}/offres/publier`,offre)

  }


}
