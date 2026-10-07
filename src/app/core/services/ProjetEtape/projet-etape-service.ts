import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { projetEtapeRequestDto } from '../../model/projetEtapeRequestDto';

@Injectable({
  providedIn: 'root',
})
export class ProjetEtapeService {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api';
  commcerEtape(projet_etape:projetEtapeRequestDto){
    return this.http.post(`${this.baseUrl}/porteur/projet-etapes/commencer`,projet_etape)
  }




}
