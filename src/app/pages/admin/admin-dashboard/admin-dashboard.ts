import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { MentorResponseDto } from '../../../core/model/MentorResponseDto';
import { AdminService } from '../../../core/services/admin/admin-service';
import { MentorDetail } from '../mentors/mentor_detail/mentor-detail';

interface AdminKpi {
  titre: string;
  valeur: number | string;
  icone: string;
}

interface ProjetSansMentor {
  id: number;
  titre: string;
  porteur: string;
  dateCreation?: string | null;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MentorDetail],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  // Les chiffres restent indisponibles tant que les endpoints réels
  // correspondants n'ont pas été confirmés. Aucun chiffre fictif n'est affiché.
  totalUtilisateurs = signal<number | string>('—');
  totalProjets = signal<number | string>('—');
  projetsEnCours = signal<number | string>('—');

  // Liste reçue depuis le service existant des mentors.
  listeMentors = signal<MentorResponseDto[]>([]);

  mentorsEnAttente = computed(() =>
    this.listeMentors().filter(mentor => mentor.statu === 'EN_ATTENTE')
  );

  mentorsApercu = computed(() => this.mentorsEnAttente().slice(0, 3));

  totalMentorsValides = computed(() =>
    this.listeMentors().filter(mentor => mentor.statu === 'ACCEPTEE').length
  );

  nombreMentorsEnAttente = computed(() => this.mentorsEnAttente().length);

  kpis = computed<AdminKpi[]>(() => [
    {
      titre: 'Nombre total d’utilisateurs',
      valeur: this.totalUtilisateurs(),
      icone: 'people'
    },
    {
      titre: 'Mentors validés',
      valeur: this.totalMentorsValides(),
      icone: 'verified_user'
    },
    {
      titre: 'Nombre total de projets',
      valeur: this.totalProjets(),
      icone: 'folder_open'
    },
    {
      titre: 'Projets en cours',
      valeur: this.projetsEnCours(),
      icone: 'pending_actions'
    }
  ]);

  // Candidatures de mentors
  chargementMentors = signal(false);
  erreurMentors = signal<string | null>(null);
  mentorSelectionne = signal<MentorResponseDto | null>(null);

  chargerDemandesMentors(): void {
    this.chargementMentors.set(true);
    this.erreurMentors.set(null);

    this.adminService.getAllMentor().subscribe({
      next: (donnees: MentorResponseDto[]) => {
        this.listeMentors.set(donnees ?? []);
        this.chargementMentors.set(false);
      },
      error: (erreur) => {
        console.error('Erreur lors du chargement des mentors :', erreur);
        this.erreurMentors.set(
          'Impossible de charger les candidatures des mentors.'
        );
        this.chargementMentors.set(false);
      }
    });
  }

  selectionnerMentor(mentor: MentorResponseDto): void {
    this.mentorSelectionne.set(mentor);
  }

  fermerModal(): void {
    this.mentorSelectionne.set(null);
  }

  // À alimenter lorsque le service et l'endpoint des projets sans mentor
  // auront été confirmés. Aucun endpoint n'est inventé ici.
  projetsSansMentor = signal<ProjetSansMentor[]>([]);

  voirTousLesMentors(): void {
    // Vérifier cette URL si la route déclarée dans le projet est différente.
    this.router.navigate(['/admin/mentor']);
  }

  ngOnInit(): void {
    this.chargerDemandesMentors();
  }
}