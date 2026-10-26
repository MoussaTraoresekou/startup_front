
export type StatutTache =
  | 'A_FAIRE'
  | 'SOUMIS'
  | 'A_CORRIGER'
  | 'VALIDEE';

export interface Tache {
  id: number;
  titre: string;
  description: string | null;

  projetId: number;
  projetTitre: string;

  membreResponsableId: number;
  membreResponsableNom: string;
  membreResponsablePrenom: string;

  dateCreation: string;
  dateEcheance: string | null;

  statut: StatutTache;

  renduDescription: string | null;
  renduUrl: string | null;
  dateSoumission: string | null;

  commentaireVerification: string | null;
  dateVerification: string | null;
}
