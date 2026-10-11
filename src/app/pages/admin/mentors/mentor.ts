import { Component, computed, inject, signal } from '@angular/core';
import { NotificationService } from '../../../core/services/notification-service';
import { MatIconModule } from '@angular/material/icon';
import { MentorResponseDto } from '../../../core/model/MentorResponseDto';
import { AdminService } from '../../../core/services/admin/admin-service';
import { MentorListe } from './mentor-liste/mentor-liste';
import { MentorDetail } from './mentor_detail/mentor-detail';
import { BarreRecherche } from '../../porteur/mes-projets/barre-recherche/barre-recherche';


@Component({
  selector: 'app-mentor',
  imports: [MatIconModule, MentorListe, MentorDetail,BarreRecherche],
  templateUrl: './mentor.html',
  styleUrl: './mentor.css',
})

export class Mentor {
  public afficheDetail=false;
  mentorSelectionne = signal<MentorResponseDto | null>(null);
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

   chargerMentors() {
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
  selectionnerMentor(mentor:MentorResponseDto){
          this.mentorSelectionne.set(mentor);

  }
  fermerModal(){
       this.mentorSelectionne.set(null)
      
  }
 
}
