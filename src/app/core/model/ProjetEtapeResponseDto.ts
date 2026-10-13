export interface ProjetEtapeResponseDto {
  id: number;
  StatutEtape: string; // 🚀 ALIGNEMENT : Remplacement du 's' minuscule par un 'S' majuscule
  dateSoumission: string | null;
  dateValidation: string | null;
  commentaireMentor: string | null;
  etape: string;
  document_url: string | null;
}
