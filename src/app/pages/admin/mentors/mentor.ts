import { Component, computed, inject, signal } from '@angular/core';
import { NotificationService } from '../../../core/services/notification-service';
import { MatIconModule } from '@angular/material/icon';
import { MentorResponseDto } from '../../../core/model/MentorResponseDto';
import { AdminService } from '../../../core/services/admin/admin-service';
import { MentorListe } from './mentor-liste/mentor-liste';
import { MentorDetail } from './mentor_detail/mentor-detail';


@Component({
  selector: 'app-mentor',
  imports: [MatIconModule, MentorListe, MentorDetail],
  templateUrl: './mentor.html',
  styleUrl: './mentor.css',
})

export class Mentor {
  public afficheDetail=false;
  mentorSelectionne = signal<MentorResponseDto | null>(null);
  private messageSnakBar = inject(NotificationService);
  private adminServices = inject(AdminService)

  listeMentors = signal<MentorResponseDto[]>([]);
  filtreActif = signal<'TOUS' | 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE'>('TOUS');

  // Compteurs dynamiques calculés automatiquement pour les onglets supérieurs
  totalTous = computed(() => this.listeMentors().length);
  totalEnAttente = computed(() => this.listeMentors().filter(m => m.statu === 'EN_ATTENTE').length);
  totalValides = computed(() => this.listeMentors().filter(m => m.statu === 'ACCEPTEE').length);
  totalRefuses = computed(() => this.listeMentors().filter(m => m.statu === 'REFUSEE').length);

  mentorsFilgres = computed(() => {
    const filtre = this.filtreActif();
    if (filtre === 'TOUS') return this.listeMentors();
    return this.listeMentors().filter(m => m.statu === filtre);
  });

  constructor() {
    this.chargerMentors();
  }

  private chargerMentors() {
    this.adminServices.getAllMentor().subscribe({
      next: (donnees) => {
        console.log(donnees)
        this.listeMentors.set(donnees)
      },
      error: (error) => {
        console.log(error)
      }
    })

  }

  public changerFiltre(nouveauFiltre: 'TOUS' | 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE'): void {
    this.filtreActif.set(nouveauFiltre);
  }

  public approuverMentor(id: number, nom: string): void {
    this.listeMentors.update(mentors =>
      mentors.map(m => m.id === id ? { ...m, statut: 'VALIDE' } : m)
    );
    this.messageSnakBar.succes(`Le mentor ${nom} a été validé et intégré à l'incubateur !`);
  }

  public rejeterMentor(id: number, nom: string): void {
    this.listeMentors.update(mentors =>
      mentors.map(m => m.id === id ? { ...m, statut: 'REFUSE' } : m)
    );
    this.messageSnakBar.succes(`L'inscription de ${nom} a été refusée.`);
  }
  selectionnerMentor(mentor:MentorResponseDto){
          this.mentorSelectionne.set(mentor);

  }
  fermerModal(){
       this.mentorSelectionne.set(null)
      
  }
}
