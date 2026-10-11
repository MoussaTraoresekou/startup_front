import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../core/services/notification-service';
import { MentorResponseDto } from '../../../core/model/MentorResponseDto';
import { PoteurService } from '../../../core/services/porteur/poteur-service';
import { InvitationMentorDto } from '../../../core/model/InvitationMentorDto';

@Component({
  selector: 'app-porteur-mentors',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './mentor.html',
  styleUrls: ['./mentor.css']
})
export class PorteurMentorsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private messageSnakBar = inject(NotificationService);
  private porteurService = inject(PoteurService);

  projetId!: number;
  listeMentors = signal<MentorResponseDto[]>([]);
  rechercheMotCle = signal<string>('');
  
  mentorSelectionne = signal<MentorResponseDto | null>(null);
  messageAccompagnement: string = '';
  demandeEnCours = false;

  mentorsFilfres = computed(() => {
    const texte = this.rechercheMotCle().toLowerCase().trim();
    if (!texte) return this.listeMentors();
    return this.listeMentors().filter(m => 
      m.nom.toLowerCase().includes(texte) || 
      m.prenom.toLowerCase().includes(texte) ||
      (m.description && m.description.toLowerCase().includes(texte))
    );
  });

  ngOnInit(): void {
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    this.projetId = parseInt(idParam || '0', 10);
    this.chargerMentorsActifs();
  }

  private chargerMentorsActifs(): void {
    this.porteurService.getAllMentor().subscribe({
      next: (donnees) => this.listeMentors.set(donnees),
      error: (err) => console.error("Erreur de récupération des mentors :", err)
    });
  }

  public ouvrirProfil(mentor: MentorResponseDto): void {
    this.mentorSelectionne.set(mentor);
    this.messageAccompagnement = ''; 
  }

  public fermerProfil(): void {
    if (!this.demandeEnCours) {
      this.mentorSelectionne.set(null);
    }
  }

  
  public envoyerDemandeMentor(mentorId: number): void {
    if (!this.messageAccompagnement.trim() || this.demandeEnCours) return;

    this.demandeEnCours = true;

    // Adaptation stricte au format de transport DTO attendu par Spring Boot
    const payload: InvitationMentorDto = {
      projetId: this.projetId,
      mentorId: mentorId,
      messageInvitation: this.messageAccompagnement
    };

    // Consommation de votre service dédié unifié
    this.porteurService.solliciterMentor(payload).subscribe({
      next: () => {
        this.demandeEnCours = false;
        this.messageSnakBar.succes("Votre demande d'accompagnement a été envoyée au mentor !");
        this.fermerProfil();
      },
      error: (erreur) => {
        this.demandeEnCours = false;
        console.error(erreur);
        this.messageSnakBar.succes("Erreur lors de l'envoi de la demande d'accompagnement.");
      }
    });
  }
}
