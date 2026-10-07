export interface questionPourEtapeResponseDto {
  id: number;
  libelle: string;
  nom_etape: string;
  // 🚀 AJOUT : Reçoit le texte de la réponse depuis la BDD (ou null si non répondue)
  reposonse_donnee: string | null; 
}
