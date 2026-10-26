

export type StatutVerification = 'VALIDEE' | 'A_CORRIGER';

export interface TacheVerification {
  statut: StatutVerification;
  commentaireVerification: string | null;
}
