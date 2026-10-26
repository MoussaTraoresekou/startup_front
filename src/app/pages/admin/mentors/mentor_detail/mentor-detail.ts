import { Component, inject, input, output } from '@angular/core';
import { MentorResponseDto } from '../../../../core/model/MentorResponseDto';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin/admin-service';
import { NotificationService } from '../../../../core/services/notification-service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mentor-detail',
  imports: [MatIconModule, DatePipe],
  templateUrl: './mentor-detail.html',
  styleUrl: './mentor-detail.css',
})
export class MentorDetail {
  mentor = input.required<MentorResponseDto>();
  valider = output<number>();
  refuser = output<number>();
  fermerOnClic = output<void>();
  mettreAjourOnclik = output<void>();
  private adminService = inject(AdminService);
  private messageSnackbar = inject(NotificationService);

 
private http = inject(HttpClient);

ouvrirDocument(nomFichier: string): void {
  const url =
    `http://localhost:8080/api/admin/documents/${encodeURIComponent(nomFichier)}`;

  this.http.get(url, { responseType: 'blob' }).subscribe({
    next: (blob) => {
      const urlBlob = URL.createObjectURL(blob);
      window.open(urlBlob, '_blank', 'noopener,noreferrer');

      setTimeout(() => URL.revokeObjectURL(urlBlob), 60000);
    },
    error: (err) => {
      console.error('Erreur ouverture document :', err);
      this.messageSnackbar.erreur(
        err.status === 401
          ? 'Session expirée ou jeton JWT absent.'
          : 'Impossible d’ouvrir le document.'
      );
    }
  });
}

  fermer() {
    this.fermerOnClic.emit();
  }
  refuserMentor(id: number) {
    this.adminService.refuserMentor(id).subscribe({
      next: (donnee) => {
        this.messageSnackbar.succes('mentor refusé avec succes avec succes!');
        this.mettreAjourOnclik.emit();
        this.fermer();
      },
      error: (erreur) => {
        console.log(erreur);
      },
    });
  }
  accepterMentore(id: number) {
    this.adminService.validerMentor(id).subscribe({
      next: (donnee) => {
        this.messageSnackbar.succes('mentor validé avec succes!');
        this.mettreAjourOnclik.emit();
        this.fermer();
      },
      error: (erreur) => {
        console.log(erreur);
      },
    });
  }
}
