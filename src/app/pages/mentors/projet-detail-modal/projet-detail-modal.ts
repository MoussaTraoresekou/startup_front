
import {
  Component,
  input,
  output,
  signal,
  inject,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
export class ProjetDetailModalComponent implements OnDestroy {
  private readonly mentorService = inject(MentorServices);
  private readonly sanitizer = inject(DomSanitizer);

  projet = input.required<ProjetDetailDto>();
  fermer = output<void>();

  afficherLecteurMedia = signal(false);
  urlPdfSecurisee = signal<SafeResourceUrl | null>(null);
  chargementPdf = signal(false);
  erreurPdf = signal(false);

  private urlObjetPdf: string | null = null;

  public basculerLecteurMedia(): void {
    const afficher = !this.afficherLecteurMedia();
    this.afficherLecteurMedia.set(afficher);

    if (!afficher) {
      this.libererPdf();
      return;
    }

    const url = this.projet().pith_url;

    if (this.estUnPdf(url)) {
      this.chargerPdf();
    }
  }

  public estUneVideo(url: string | null | undefined): boolean {
    if (!url) return false;

    return /\.(mp4|webm|ogg|mov|mkv|m4v)(?:$|[?#])/i.test(url);
  }

  public estUnPdf(url: string | null | undefined): boolean {
    if (!url) return false;

    return /\.pdf(?:$|[?#])/i.test(url);
  }

  private extraireNomFichier(url: string): string {
    const sansParametres = url.split(/[?#]/)[0];
    const parties = sansParametres.split('/');
    return decodeURIComponent(parties[parties.length - 1]);
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
      .pipe(finalize(() => this.chargementPdf.set(false)))
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

  private libererPdf(): void {
    this.urlPdfSecurisee.set(null);

    if (this.urlObjetPdf) {
      URL.revokeObjectURL(this.urlObjetPdf);
      this.urlObjetPdf = null;
    }
  }

  public ngOnDestroy(): void {
    this.libererPdf();
  }
}
