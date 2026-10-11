import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { projetEtapeRequestDto } from '../../model/projetEtapeRequestDto';
import { commencerEtapeReponseDto } from '../../model/commencerEtapeReponseDto';

@Injectable({
  providedIn: 'root',
})
export class ProjetEtapeService {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api';
  commcerEtape(projet_etape:projetEtapeRequestDto){
    return this.http.put<commencerEtapeReponseDto>(`${this.baseUrl}/porteur/projet-etapes/commencer`,projet_etape)
  }




}
