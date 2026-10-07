import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../model/LoginRequest';
import { LoginResponse } from '../model/LoginResponse';

@Injectable({
  providedIn: 'root' 
})
export class AuthService {  
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/user/login`, credentials).pipe(
      tap((response: LoginResponse) => {
        if (response && response.token) {
          // Stockage du jeton de sécurité et du rôle
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          
          // Stockage immédiat de l'identité (reçue directement dans la réponse du login)
          localStorage.setItem('userId', response.id.toString());
          localStorage.setItem('nom', response.nom);
          localStorage.setItem('prenom', response.prenom);
          localStorage.setItem('email', response.email);
        }
      })
    );
  }

  
  logout(): void {
    localStorage.clear(); 
  }

  estConnecte(): boolean {
    return localStorage.getItem('token') !== null;
  }

  getRole(): string | null { return localStorage.getItem('role'); }
  getNomComplet(): string { return `${localStorage.getItem('prenom')} ${localStorage.getItem('nom')}`; }
  getUserId(): number { return parseInt(localStorage.getItem('userId') || '0', 10); }
  getNom(){
    return localStorage.getItem("nom")
  }
  getPNom(){
    return localStorage.getItem("prenom")
  }
}
