import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { LoginRequest } from '../model/LoginRequest';
import { LoginResponse } from '../model/LoginResponse';
import { ProfilUpdateDto } from '../model/profil-update.dto';
import { ProfilResponseDto } from '../model/profil-response.dto';

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

  // =========================
  // AUTHENTIFICATION
  // =========================

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

      return payload.exp * 1000 <= Date.now();

    } catch {
      return true;
    }
  }

  // =========================
  // GESTION DU PROFIL
  // =========================

  getProfil(): Observable<ProfilResponseDto> {
    return this.http.get<ProfilResponseDto>(
      `${this.baseUrl}/user/profil`
    );
  }

  modifierProfil(
    donnees: ProfilUpdateDto
  ): Observable<ProfilResponseDto> {

    return this.http
      .put<ProfilResponseDto>(
        `${this.baseUrl}/user/profil`,
        donnees
      )
      .pipe(
        tap((profil: ProfilResponseDto) => {
          this.synchroniserSession(profil);
        })
      );
  }

  /**
   * Actualise les informations personnelles
   * dans localStorage après modification du profil.
   */
  private synchroniserSession(profil: ProfilResponseDto): void {
    localStorage.setItem('nom', profil.nom);
    localStorage.setItem('prenom', profil.prenom);
  }

  // =========================
  // INFORMATIONS UTILISATEUR
  // =========================

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

  getEmail(): string | null {
    return localStorage.getItem('email');
  }
}