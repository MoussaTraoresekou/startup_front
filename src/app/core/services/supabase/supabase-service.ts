import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environnement/environnement';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // Instance du client Supabase
  private supabase: SupabaseClient;
  
  // Nom du dossier de stockage configuré dans votre console Supabase Storage
  private bucketName = 'pitches';

  constructor() {
    // Initialisation de la connexion sécurisée
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey || environment.supabaseKey);
  }

  /**
   * Téléverse un fichier binaire (PDF, Vidéo) dans le Storage Supabase
   * et retourne son URL publique sous forme d'Observable.
   */
  uploadPitchFile(file: File): Observable<string> {
    // 1. Génération d'un nom de fichier unique pour éviter les écrasements (ex: 17182932_mon-pitch.pdf)
    const nomUniqueFichier = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // 2. Création du chemin d'accès dans le bucket
    const cheminFichier = `porteurs/${nomUniqueFichier}`;

    // 3. Envoi du fichier binaire vers le bucket Cloud (on transforme la Promesse en Observable RxJS)
    const RequeteUploadPromise = this.supabase.storage
      .from(this.bucketName)
      .upload(cheminFichier, file, {
        cacheControl: '3600',
        upsert: false // Évite d'écraser un fichier existant
      });

    return from(RequeteUploadPromise).pipe(
      map(({ data, error }) => {
        // Si Supabase renvoie une erreur (ex: Bucket introuvable, taille maximale dépassée)
        if (error) {
          throw new Error(`Échec de l'envoi chez Supabase : ${error.message}`);
        }

        // 4. Récupération de l'URL publique générée par le CDN de Supabase
        const { data: publicUrlData } = this.supabase.storage
          .from(this.bucketName)
          .getPublicUrl(cheminFichier);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error("Impossible de générer l'adresse d'accès publique du fichier.");
        }

        // Renvoie l'URL finale (ex: https://supabase.co...)
        return publicUrlData.publicUrl;
      })
    );
  }
}
