
export interface MessageModel {
  id: number;
  conversationId: number;
  expediteurId: number;
  expediteurNom: string;
  contenu: string;
  dateEnvoi: string;
  dateLecture: string | null;
}

export interface EnvoyerMessageDTO {
  contenu: string;
}
