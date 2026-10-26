
export interface MembreEquipeDto {
  id: number;
  projetId: number;
  utilisateurId: number;

  nom: string;
  prenom: string;
  roleEcosysteme: string;
  specialite: string;

  roleProjet: string;
  fonction: string;
  responsabilites: string;

  dateIntegration: string;
  statut: string;
}
