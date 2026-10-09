import { Component, inject, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SecteurService } from '../../../../core/services/secteur/secteur-service';
import { SecteurReponse } from '../../../../core/model/secteurReponse';


@Component({
  selector: 'app-filtre-secteur',
  imports: [MatIconModule],
  templateUrl: './filtre-secteur.html',
  styleUrl: './filtre-secteur.css',
})
export class FiltreSecteur {
    filtrEmitclic=output<string>()
    private secteurServive=inject(SecteurService)
    secteurs=signal<SecteurReponse[]>([]);
    constructor(){
        this.secteurServive.getSecteurs().subscribe({
            next:(donnees)=>{
              this.secteurs.set(donnees)
            },
            error:(erreur)=>{
            }
        })
    }
    filterParsecteur(nomSecteur:string){
      console.log(nomSecteur)
            this.filtrEmitclic.emit(nomSecteur)
    }

}
