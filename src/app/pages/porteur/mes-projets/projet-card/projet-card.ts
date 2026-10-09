import { Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ProjetResponse } from '../../../../core/model/ProjetResponse';

@Component({
  selector: 'app-projet-card',
  imports: [MatIconModule],
  templateUrl: './projet-card.html',
  styleUrl: './projet-card.css',
})
export class ProjetCard {
    private router=inject(Router)
    projet=input.required<ProjetResponse>()
    editOnclic=output<number>()
    deleteOnclic=output<number>()
    visaliserOnclic=output<number>()
    modifier(id:number){
      this.editOnclic.emit(id)
    }
    supprimerProjet(id:number){
           if(confirm("voulez-vous supprimer ce projet")){
                 this.deleteOnclic.emit(id)
           }        
    }
    visualiser(id:number){
         this.visaliserOnclic.emit(id)
    }
    ouvrirProjet(projet: ProjetResponse) {
    localStorage.setItem('activeProjetId', projet.id.toString());
    localStorage.setItem('activeProjetNom', projet.titre);
    this.router.navigate(['/porteur/projets', projet.id, 'dashboard']);
  }
}
