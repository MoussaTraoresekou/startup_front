import { inject, Injectable } from '@angular/core';
import { MentorResponseDto } from '../../model/MentorResponseDto';
import { HttpClient } from '@angular/common/http';
import { InvitationMentorDto } from '../../model/InvitationMentorDto';
import { Observable } from 'rxjs';
import { ProjetEtapeResponseDto } from '../../model/ProjetEtapeResponseDto';

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
  
  public soumettreEtape(projetEtapeId: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/projet-etapes/${projetEtapeId}/soumettre`, {}, { responseType: 'text' });
  }
    /**
   * 📡 REAL DATA : Récupère la liste réelle des étapes associées à un projet précis
   */
  public getEtapesProjet(projetId: number): Observable<ProjetEtapeResponseDto[]> {
    return this.http.get<ProjetEtapeResponseDto[]>(`${this.baseUrl}/projets/${projetId}/etapes`);
  }
  


}
