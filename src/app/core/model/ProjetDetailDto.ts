export interface ProjetDetailDto {
  id: number;
  titre: string;
  description: string;
  pith_url: string | null;
  quota_propose: string;
  secteur: string;
  porteurNomComplet: string;
  date_creation?: string;
  nombreLikes?: number;
  pith_thumbnail_url: string | null;

}