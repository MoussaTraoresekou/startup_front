import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjetService } from '../../core/services/projet-service';
import { ProjetResponse } from '../../core/model/ProjetResponse';
import { NotificationService } from '../../core/services/notification-service';
import { ProjetFormAdd } from './projet-form-add/projet-form-add';
import { ProjetFormEdit } from './projet-form-edit/projet-form-edit';
import { ProjetCard } from './projet-card/projet-card';
import { BarreRecherche } from './barre-recherche/barre-recherche';
import { FiltreSecteur } from './filtre-secteur/filtre-secteur';
@Component({
  selector: 'app-mes-projets',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ProjetFormAdd,
    ProjetFormEdit,
    ProjetCard,
    BarreRecherche,FiltreSecteur
  ],
  templateUrl: './mes-projets.html',
  styleUrl: './mes-projets.css'
})
export class MesProjets  {

  private projetService = inject(ProjetService);
  private router = inject(Router);
  projets = signal<ProjetResponse[]>([])
  formulaireVisible = false
  formulaireVisibleforEdit = false
  messageSnackBar = inject(NotificationService)
  constructor() {
    this.chargerProjet("","")
  }
  chargerProjet(secteur: string, titre:string) {
    this.projetService.getProjetsDuPorteur().subscribe(
      {
        next: (response) => {
          console.log(response)
          if (secteur === "" ||titre==="") {
            console.log("lllflf")
            this.projets.set(response)

          } else {
            console.log("diffent")

            this.projets.set(response.filter((projet) => 
              projet.secteur.toLowerCase().includes(secteur.toLowerCase())||projet.secteur.toLowerCase().includes(titre.toLowerCase())))

          }

        }
      }
    )
  }
  //se declenche lors d'un clique le bouton ajouter
  ouverFermer() {
    this.formulaireVisible = true
  }
  annuler(val: boolean) {
    this.formulaireVisible = val
  }
  //cett fonction met à jour la lsite des conseils et ferme le modal
  AjoutEffectuer() {
    this.formulaireVisible = false
    this.chargerProjet("","")
    this.messageSnackBar.succes("projet posté avec succes!")
  }
  ouvrirProjet(projet: ProjetResponse) {
    localStorage.setItem('activeProjetId', projet.id.toString());
    localStorage.setItem('activeProjetNom', projet.titre);

    this.router.navigate(['/porteur/projets', projet.id, 'dashboard']);
  }

  creerProjet() {
    this.formulaireVisible=true
  }
  
}
