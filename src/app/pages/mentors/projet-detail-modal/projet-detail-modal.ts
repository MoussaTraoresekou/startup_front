import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import { ProjetDetailDto } from '../../../core/model/ProjetDetailDto';

@Component({
  selector: 'app-projet-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './projet-detail-modal.html',
  styleUrl: './projet-detail-modal.css'
})
export class ProjetDetailModalComponent {

  private readonly sanitizer = inject(DomSanitizer);

  projet = input.required<ProjetDetailDto>();

  fermer = output<void>();

  afficherLecteurMedia = signal<boolean>(false);

  /**
   * Afficher ou masquer le lecteur.
   */
  public basculerLecteurMedia(): void {
    this.afficherLecteurMedia.update(etat => !etat);
  }

  /**
   * Détecter une vidéo à partir de son extension.
   */
  public estUneVideo(url: string | null | undefined): boolean {
    if (!url) {
      return false;
    }

    try {
      const chemin = new URL(url).pathname;

      return /\.(mp4|webm|ogg|mov|mkv|m4v)$/i.test(chemin);
    } catch {
      return false;
    }
  }

  /**
   * Détecter un document PDF.
   */
  public estUnPdf(url: string | null | undefined): boolean {
    if (!url) {
      return false;
    }

    try {
      const chemin = new URL(url).pathname;

      return /\.pdf$/i.test(chemin);
    } catch {
      return false;
    }
  }

  /**
   * Sécuriser l'URL utilisée dans l'iframe.
   * Seul le stockage public du projet Supabase configuré est accepté.
   */
  public chargerUrlSecurisee(
    urlBrute: string | null | undefined
  ): SafeResourceUrl {
    const urlVide = this.sanitizer.bypassSecurityTrustResourceUrl(
      'about:blank'
    );

    if (!urlBrute) {
      return urlVide;
    }

    try {
      const url = new URL(urlBrute);

      const origineAutorisee =
        url.protocol === 'https:' &&
        url.hostname === 'zoagjvcjrolrrlhdkhob.supabase.co' &&
        url.pathname.startsWith('/storage/v1/object/public/pitches/');

      if (!origineAutorisee || !this.estUnPdf(url.href)) {
        return urlVide;
      }

      return this.sanitizer.bypassSecurityTrustResourceUrl(url.href);

    } catch {
      return urlVide;
    }
  }
}
