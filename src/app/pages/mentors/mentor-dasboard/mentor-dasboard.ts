import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth-service';

interface MentorKpi {
  titre: string;
  valeur: number;
  icone: string;
  couleurClasse: string;
}

interface StartupAssignee {
  id: number;
  titre: string;
  porteur: string;
  secteur: string;
  etape: string;
  dateAssociation: string;
}

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './mentor-dasboard.html',
  styleUrls: ['./mentor-dasboard.css']
})
export class MentorDashboardComponent implements OnInit {
  public authService = inject(AuthService);

  kpis = signal<MentorKpi[]>([]);
  startups = signal<StartupAssignee[]>([]);

  ngOnInit(): void {
    this.chargerDonneesDashboard();
  }

  private chargerDonneesDashboard(): void {
    this.kpis.set([
      { titre: 'Startups accompagnées', valeur: 3, icone: 'rocket_launch', couleurClasse: 'green' },
      { titre: 'Demandes en attente', valeur: 2, icone: 'handshake', couleurClasse: 'orange' },
      { titre: 'Heures de coaching', valeur: 48, icone: 'schedule', couleurClasse: 'blue' },
      { titre: 'Formations actives', valeur: 1, icone: 'menu_book', couleurClasse: 'fuchsia' }
    ]);

    this.startups.set([
      { id: 10, titre: 'Waati Delivery', porteur: 'Moussa Diarra', secteur: 'Logistique / Transport', etape: 'Formalisation', dateAssociation: '15 Sept. 2026' },
      { id: 11, titre: 'AgroTech Mali', porteur: 'Kadiatou Diallo', secteur: 'Agriculture / Tech', etape: 'Business Plan', dateAssociation: '02 Oct. 2026' },
      { id: 12, titre: 'Sini Santé', porteur: 'Ibrahim Cissé', secteur: 'E-Santé', etape: 'Idéation', dateAssociation: '08 Oct. 2026' }
    ]);
  }

  public gererStartup(id: number): void {
    console.log(`Ouverture de l'espace de suivi pour la startup ID : ${id}`);
  }
}
