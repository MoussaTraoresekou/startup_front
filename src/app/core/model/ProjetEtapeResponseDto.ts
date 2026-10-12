export interface ProjetEtapeResponseDto {
  id: number;
  statutEtape: string;
  dateSoumission: string | null;
  dateValidation: string | null;
  commentaireMentor: string | null;
  etape: string;
  document_url: string | null;
}
