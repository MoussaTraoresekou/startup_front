import { HttpClient } from '@angular/common/http';
import { Component, inject, Injectable } from '@angular/core';
import { SecteurReponse } from '../../model/secteurReponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
@Component({
  selector: 'app-secteur-service',
  imports: [],
  templateUrl: './secteur-service.html',
  styleUrl: './secteur-service.css',
})
export class SecteurService {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api';

   getSecteurs(){
     return this.http.get<SecteurReponse[]>(`${this.baseUrl}/secteur`);
  }


}
