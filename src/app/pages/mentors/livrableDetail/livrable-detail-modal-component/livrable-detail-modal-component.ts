import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LivrableEtapeDto } from '../../../../core/model/LivrableEtapeDto';
import { MentorServices } from '../../../../core/services/mentor/mentor-services';
import { NotificationService } from '../../../../core/services/notification-service';

@Component({
  selector: 'app-livrable-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './livrable-detail-modal-component.html',
  styleUrl: './livrable-detail-modal-component.css'
})
export class LivrableDetailModalComponent {
  private mentorService = inject(MentorServices);
  private messageSnakBar = inject(NotificationService);

  projetEtapeId = input.required<number>();
  livrable = input.required<LivrableEtapeDto>();
  
  fermer = output<void>();
  actionTerminee = output<void>();

  commentaire = signal<string>('');
  chargement = signal<boolean>(false);

  public validerEtape(): void {
    if (this.chargement()) return;
    this.chargement.set(true);

    const dto = {
      projetEtapeId: this.projetEtapeId(),
      commentaireMentor: this.commentaire() || 'Étape validée avec succès.'
    };

    this.mentorService.validerEtapeParMentor(dto).subscribe({
      next: () => {
        this.chargement.set(false);
        this.messageSnakBar.succes("L'étape a été validée avec succès.");
        this.actionTerminee.emit();
        this.fermer.emit();
      },
      error: (err) => {
        this.chargement.set(false);
        console.error(err);
      }
    });
  }

  public renvoyerCorrection(): void {
    if (!this.commentaire().trim()) {
      this.messageSnakBar.erreur("Veuillez saisir un motif ou un commentaire pour guider le porteur sur ses corrections.");
      return;
    }

    if (this.chargement()) return;
    this.chargement.set(true);

    const dto = {
      projetEtapeId: this.projetEtapeId(),
      commentaireMentor: this.commentaire()
    };

    this.mentorService.renvoyerPourCorrection(dto).subscribe({
      next: () => {
        this.chargement.set(false);
        this.messageSnakBar.succes("L'étape a été renvoyée pour modification.");
        this.actionTerminee.emit();
        this.fermer.emit();
      },
      error: (err) => {
        this.chargement.set(false);
        console.error(err);
      }
    });
  }
}
