import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CollaborateurRegisterRequestDto } from '../../model/CollaborateurRegisterRequestDto';
import { CollaborateurResponseDto } from '../../model/CollaborateurResponseDto';

@Injectable({
  providedIn: 'root',
})
export class CollaborateurService {
  private baseUrl = 'http://localhost:8080/api/collaborateur';
  private http=inject(HttpClient)
  register_collaborateur(collaborateur:CollaborateurRegisterRequestDto){
     return this.http.post<CollaborateurResponseDto>(`${this.baseUrl}/register`,collaborateur)
  }
}
