export interface CollaborateurRegisterRequestDto {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  password: string;
  specialite: string;
  biographie?: string;
  lienPortfolio?: string;
}
