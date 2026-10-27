export interface DashboardPorteur {
  projetId: number;
  titre: string;
  secteur?: string | null;

  investisseursInteresses: number;
  membresActifs: number;
  etapesValidees: number;
  etapesEnCours: number;

  etapes: EtapeDashboard[];
  equipe: MembreEquipeDashboard[];

  dernierCommentaireMentor: RetourMentorDashboard | null;
}

export interface EtapeDashboard {
  id: number;
  nom: string;
  statut: string | null;
  dateSoumission: string | null;
  dateValidation: string | null;
  commentaireMentor: string | null;
}

export interface MembreEquipeDashboard {
  id: number;
  nom: string;
  prenom: string;
  role: string | null;
}

export interface RetourMentorDashboard {
  commentaire: string;
  etape: string | null;
  date: string | null;
}