export interface RegisterMentorRequest {
  prenom: string;
  nom: string;
  email: string;
  motDePass: string;
  telephone: string;
  cvUrl: string;       // Reçoit l'URL finale générée par Supabase
  diplomeUrl: string;  // Reçoit l'URL finale générée par Supabase
  description: string; // Description de l'expertise du mentor
}
