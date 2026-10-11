import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../core/services/notification-service';

interface AdminKpi {
  titre: string;
  valeur: number;
  evolution: string;
  estPositif: boolean;
  icone: string;
  couleurClasse: string;
}

interface ProjetsParEtape {
  etape: string;
  quantite: number;
  pourcentage: number;
  couleurHex: string;
}

interface DemandeValidation {
  id: number;
  nomComplet: string;
  roleDemande: string;
  dateDemande: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  private messageSnakBar = inject(NotificationService);

  // Signaux pour stocker les blocs du tableau de bord
  kpis = signal<AdminKpi[]>([]);
  repartitionProjets = signal<ProjetsParEtape[]>([]);
  demandesValidation = signal<DemandeValidation[]>([]);

  ngOnInit(): void {
    this.chargerDonneesDashboard();
  }

  /**
   * Simule ou récupère les indicateurs analytiques du backend Spring Boot
   */
  private chargerDonneesDashboard(): void {
    // 1. Les 4 Cartes KPI du haut
    this.kpis.set([
      { titre: 'Total projets', valeur: 124, evolution: '+12% ce mois', estPositif: true, icone: 'business_center', couleurClasse: 'blue' },
      { titre: 'Projets en cours', valeur: 56, evolution: '+8% cette semaine', estPositif: true, icone: 'trending_up', couleurClasse: 'orange' },
      { titre: 'Utilisateurs actifs', valeur: 320, evolution: '+15% ce mois', estPositif: true, icone: 'people', couleurClasse: 'fuchsia' },
      { titre: 'Mentors validés', valeur: 42, evolution: '-2% ce mois', estPositif: false, icone: 'school', couleurClasse: 'green' }
    ]);

    // 2. Les données de répartition par étape (Donut Chart)
    this.repartitionProjets.set([
      { etape: 'Idéation', quantite: 28, pourcentage: 22.6, couleurHex: '#1A73E8' },
      { etape: 'Business Plan', quantite: 34, pourcentage: 27.4, couleurHex: '#F59E0B' },
      { etape: 'Formalisation', quantite: 45, pourcentage: 36.3, couleurHex: '#059669' },
      { etape: 'Lancement', quantite: 17, pourcentage: 13.7, couleurHex: '#EC4899' }
    ]);

    // 3. Les demandes urgentes en attente de validation
    this.demandesValidation.set([
      { id: 101, nomComplet: 'Abdoulaye Tounkara', roleDemande: 'Mentor / Formation', dateDemande: 'Il y a 2h' },
      { id: 102, nomComplet: 'Moussa Diarra', roleDemande: 'Porteur / Startup', dateDemande: 'Il y a 1 jour' },
      { id: 103, nomComplet: 'Aïssata Maïga', roleDemande: 'Mentor / Finance', dateDemande: 'Il y a 3 jours' }
    ]);
  }

  /**
   * Traitement d'approbation d'un nouvel utilisateur par l'admin
   */
  public approuverDemande(id: number, nom: string): void {
    this.demandesValidation.update(demandes => demandes.filter(d => d.id !== id));
    this.messageSnakBar.succes(`Le compte de ${nom} a été approuvé avec succès !`);
  }

  /**
   * Traitement de rejet d'une demande
   */
  public rejeterDemande(id: number, nom: string): void {
    this.demandesValidation.update(demandes => demandes.filter(d => d.id !== id));
    this.messageSnakBar.succes(`La demande de ${nom} a été refusée.`);
  }
}

AdminDashboard