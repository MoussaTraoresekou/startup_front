export type EnumCandidature = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
export interface CandidatureRecueDto {
  id: number;
  statuCandidature: EnumCandidature;
  motivation: string;
  dateCreation: string; // Stocké sous forme de chaîne ISO (LocalDateTime) pour les pipes de date Angular
  collaboratorId: number;
  collaborateurNom: string;
  collaborateurPrenom: string;
  collaborateurEmail: string;
  collaborateurTelephone: string;
  collaborateurSpecialite: string;
  collaborateurBiographie: string;
  collaborateurLienPortfolio: string;
  offresId: number;
  offresTitre: string;
}
