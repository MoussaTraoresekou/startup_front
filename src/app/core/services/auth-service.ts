
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

  private readonly clesSession = [
    'token',
    'role',
    'userId',
    'nom',
    'prenom',
    'email'
  ];

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.baseUrl}/user/login`,
        credentials
      )
      .pipe(
        tap((response: LoginResponse) => {
          if (response?.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            localStorage.setItem('userId', response.id.toString());
            localStorage.setItem('nom', response.nom);
            localStorage.setItem('prenom', response.prenom);
            localStorage.setItem('email', response.email);
          }
        })
      );
  }

  logout(): void {
    // Supprimer uniquement les données liées à la session.
    this.clesSession.forEach(cle => localStorage.removeItem(cle));
  }

  estConnecte(): boolean {
    const token = localStorage.getItem('token');

    if (!token || this.tokenEstExpire(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  private tokenEstExpire(token: string): boolean {
    try {
      const parties = token.split('.');

      if (parties.length !== 3) {
        return true;
      }

      // Décoder le payload du JWT.
      const payloadBase64 = parties[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const payload = JSON.parse(
        atob(payloadBase64.padEnd(
          payloadBase64.length + (4 - payloadBase64.length % 4) % 4,
          '='
        ))
      );

      if (typeof payload.exp !== 'number') {
        return true;
      }

      // exp est exprimé en secondes.
      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getNomComplet(): string {
    const prenom = localStorage.getItem('prenom') ?? '';
    const nom = localStorage.getItem('nom') ?? '';

    return `${prenom} ${nom}`.trim();
  }

  getUserId(): number {
    return Number(localStorage.getItem('userId') ?? 0);
  }

  // Conservée pour ne pas casser les composants qui l'utilisent.
  getUtilisateurId(): number {
    return this.getUserId();
  }

  getNom(): string | null {
    return localStorage.getItem('nom');
  }

  getPNom(): string | null {
    return localStorage.getItem('prenom');
  }
}
