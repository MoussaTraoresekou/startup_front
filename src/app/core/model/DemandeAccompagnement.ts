interface DemandeAccompagnement {
  id: number;
  projetId: number;
  projetTitre: string;
  porteurNom: string;
  secteur: string;
  messageInvitation: string;
  dateDemande: string;
  statut: StatutDemande;
}
