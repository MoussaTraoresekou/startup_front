import {
  Component,
  input,
  output,
  signal,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';
import { finalize } from 'rxjs';

import { ProjetDetailDto } from '../../../core/model/ProjetDetailDto';
import { MentorServices } from '../../../core/services/mentor/mentor-services';

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
export class ProjetDetailModalComponent implements OnInit, OnDestroy {
  private readonly mentorService = inject(MentorServices);
  private readonly sanitizer = inject(DomSanitizer);

  projet = input.required<ProjetDetailDto>();
  fermer = output<void>();

  afficherLecteurMedia = signal(false);

  urlPdfSecurisee = signal<SafeResourceUrl | null>(null);
  urlVideo = signal<string | null>(null);
  urlMiniature = signal<string | null>(null);

  chargementPdf = signal(false);
  chargementVideo = signal(false);
  chargementMiniature = signal(false);

  erreurPdf = signal(false);
  erreurVideo = signal(false);
  erreurMiniature = signal(false);

  private urlObjetPdf: string | null = null;
  private urlObjetVideo: string | null = null;
  private urlObjetMiniature: string | null = null;

  ngOnInit(): void {
    // Charger la miniature dès l'ouverture de la fiche,
    // sans télécharger la vidéo complète.
    const projet = this.projet();

    if (this.estUneVideo(projet.pith_url)) {
      this.chargerMiniature();
    }
  }

  public basculerLecteurMedia(): void {
    if (this.afficherLecteurMedia()) {
      this.afficherLecteurMedia.set(false);
      this.libererPdf();
      this.libererVideo();
      return;
    }

    this.afficherLecteurMedia.set(true);

    const url = this.projet().pith_url;

    if (this.estUnPdf(url)) {
      this.chargerPdf();
    } else if (this.estUneVideo(url)) {
      // La miniature est déjà chargée si elle existe.
      this.chargerVideo();
    }
  }

  public estUneVideo(
    url: string | null | undefined
  ): boolean {
    if (!url) return false;

    return /\.(mp4|webm|ogg|mov|mkv|m4v)(?:$|[?#])/i.test(url);
  }

  public estUnPdf(
    url: string | null | undefined
  ): boolean {
    if (!url) return false;

    return /\.pdf(?:$|[?#])/i.test(url);
  }

  private extraireNomFichier(url: string): string {
    const sansParametres = url.split(/[?#]/)[0];
    const parties = sansParametres.split('/');
    const dernierElement = parties[parties.length - 1];

    try {
      return decodeURIComponent(dernierElement);
    } catch {
      return dernierElement;
    }
  }

  private chargerMiniature(): void {
    const url = this.projet().pith_thumbnail_url;

    if (
      !url ||
      this.chargementMiniature() ||
      this.urlMiniature()
    ) {
      return;
    }

    const nomFichier = this.extraireNomFichier(url);

    if (!nomFichier) {
      this.erreurMiniature.set(true);
      return;
    }

    this.chargementMiniature.set(true);
    this.erreurMiniature.set(false);

    this.mentorService.consulterDocument(nomFichier)
      .pipe(
        finalize(() => this.chargementMiniature.set(false))
      )
      .subscribe({
        next: blob => {
          if (blob.size === 0) {
            this.erreurMiniature.set(true);
            return;
          }

          this.libererMiniature();

          this.urlObjetMiniature = URL.createObjectURL(
            new Blob([blob], { type: 'image/jpeg' })
          );

          this.urlMiniature.set(this.urlObjetMiniature);
        },
        error: erreur => {
          console.error(
            'Erreur de chargement de la miniature :',
            erreur
          );
          this.erreurMiniature.set(true);
        }
      });
  }

  private chargerPdf(): void {
    const url = this.projet().pith_url;

    if (!url || this.chargementPdf()) return;

    const nomFichier = this.extraireNomFichier(url);

    if (!nomFichier) {
      this.erreurPdf.set(true);
      return;
    }

    this.libererPdf();
    this.chargementPdf.set(true);
    this.erreurPdf.set(false);

    this.mentorService.consulterDocument(nomFichier)
      .pipe(
        finalize(() => this.chargementPdf.set(false))
      )
      .subscribe({
        next: blob => {
          if (blob.size === 0) {
            this.erreurPdf.set(true);
            return;
          }

          this.urlObjetPdf = URL.createObjectURL(
            new Blob([blob], { type: 'application/pdf' })
          );

          this.urlPdfSecurisee.set(
            this.sanitizer.bypassSecurityTrustResourceUrl(
              this.urlObjetPdf
            )
          );
        },
        error: erreur => {
          console.error('Erreur de chargement du PDF :', erreur);
          this.erreurPdf.set(true);
        }
      });
  }

  private chargerVideo(): void {
    const url = this.projet().pith_url;

    if (!url || this.chargementVideo()) return;

    const nomFichier = this.extraireNomFichier(url);

    if (!nomFichier) {
      this.erreurVideo.set(true);
      return;
    }

    this.libererVideo();
    this.chargementVideo.set(true);
    this.erreurVideo.set(false);

    this.mentorService.consulterDocument(nomFichier)
      .pipe(
        finalize(() => this.chargementVideo.set(false))
      )
      .subscribe({
        next: blob => {
          if (blob.size === 0) {
            this.erreurVideo.set(true);
            return;
          }

          const typeVideo = this.determinerTypeVideo(nomFichier);

          this.urlObjetVideo = URL.createObjectURL(
            new Blob([blob], { type: typeVideo })
          );

          this.urlVideo.set(this.urlObjetVideo);
        },
        error: erreur => {
          console.error('Erreur de chargement de la vidéo :', erreur);
          this.erreurVideo.set(true);
        }
      });
  }

  private determinerTypeVideo(nomFichier: string): string {
    const extension = nomFichier
      .split('.')
      .pop()
      ?.toLowerCase();

    switch (extension) {
      case 'webm':
        return 'video/webm';
      case 'ogg':
        return 'video/ogg';
      case 'mov':
        return 'video/quicktime';
      case 'mkv':
        return 'video/x-matroska';
      case 'm4v':
        return 'video/x-m4v';
      default:
        return 'video/mp4';
    }
  }

  public reessayerPdf(): void {
    if (this.chargementPdf()) return;
    this.chargerPdf();
  }

  public reessayerVideo(): void {
    if (this.chargementVideo()) return;
    this.chargerVideo();
  }

  public reessayerMiniature(): void {
    if (this.chargementMiniature()) return;

    this.erreurMiniature.set(false);
    this.chargerMiniature();
  }

  private libererPdf(): void {
    this.urlPdfSecurisee.set(null);

    if (this.urlObjetPdf) {
      URL.revokeObjectURL(this.urlObjetPdf);
      this.urlObjetPdf = null;
    }
  }

  private libererVideo(): void {
    this.urlVideo.set(null);

    if (this.urlObjetVideo) {
      URL.revokeObjectURL(this.urlObjetVideo);
      this.urlObjetVideo = null;
    }
  }

  private libererMiniature(): void {
    this.urlMiniature.set(null);

    if (this.urlObjetMiniature) {
      URL.revokeObjectURL(this.urlObjetMiniature);
      this.urlObjetMiniature = null;
    }
  }

  private libererMedias(): void {
    this.libererPdf();
    this.libererVideo();
    this.libererMiniature();
  }

  ngOnDestroy(): void {
    this.libererMedias();
  }
}