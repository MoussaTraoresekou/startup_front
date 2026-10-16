export interface PorteurResponseDto {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  specialite: string;
  biographie?: string;
  lienPortfolio?: string;
}
