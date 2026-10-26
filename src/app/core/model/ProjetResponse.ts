export interface ProjetResponse {
  id: number;
  titre: string;
  description: string;
  pith_url: string | null;
  pith_thumbnail_url: string | null;
  pith_type: string | null;
  quota_propose: string;
  secteur: string;
  porteurNomComplet?: string;
  date_creation?: string;
  nombreLikes?: number;
}