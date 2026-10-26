
export interface ConversationModel {
  id: number;
  projetId: number;
  projetTitre: string;

  investisseurId: number;
  investisseurNom: string;

  porteurId: number;
  porteurNom: string;

  dernierMessage: string | null;
  dateCreation: string;
  dateDernierMessage: string | null;
}
