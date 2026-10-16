import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SpecialiteResponse } from '../../model/specialiteResponse';

@Injectable({
  providedIn: 'root',
})
export class SpecialiteService {
    private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api';

   getSpecialite(){
     return this.http.get<SpecialiteResponse[]>(`${this.baseUrl}/specialites`);
  }
}
