import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjetResponse } from '../model/ProjetResponse';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {

  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/porteur';

  getProjetsDuPorteur(): Observable<ProjetResponse[]> {
    return this.http.get<ProjetResponse[]>(`${this.baseUrl}/projets`);
  }
}
