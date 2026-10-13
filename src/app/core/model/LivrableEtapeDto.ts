export interface QuestionReponseDto {
  questionTexte: string;
  reponseValeur: string;
}

export interface LivrableEtapeDto {
  projetTitre: string;
  etapeTitre: string;
  porteurNomComplet: string;
  elements: QuestionReponseDto[];
}
