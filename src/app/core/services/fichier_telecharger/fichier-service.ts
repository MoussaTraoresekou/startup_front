import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FichierService {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api';

  telecharger(projet_etape_id:string){
      this.http.get(`${this.baseUrl}/porteur/projetEtape/${projet_etape_id}/telecharger-livrable`)
  }
  telechargerLivrableFichier(projetEtapeId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/porteur/projetEtape/${projetEtapeId}/telecharger-livrable`, 
      { responseType: 'blob' }
    );
  }

}
