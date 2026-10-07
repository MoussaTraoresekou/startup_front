import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EtapeService } from '../../core/services/etape/etape-service';
import { EtapeResponseDto } from '../../core/model/EtapeResponseDto';
import { ProjetEtapeService } from '../../core/services/ProjetEtape/projet-etape-service';
import { projetEtapeRequestDto } from '../../core/model/projetEtapeRequestDto';
import { NotificationService } from '../../core/services/notification-service';
import { QuestionEtapeService } from '../../core/services/question_etape/question-etape-service';
import { questionPourEtapeResponseDto } from '../../core/model/questionPourEtapeResponseDto';
@Component({
  selector: 'app-parcours',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './parcours.html',
  styleUrls: ['./parcours.css']
})
export class Parcours  {
  private projetEtapeService=inject(ProjetEtapeService)
  nomProjet: string = 'Waati Delivery';
  private etapeServive=inject(EtapeService)
  listeEtapes=signal<EtapeResponseDto[]>([])
  messageSnakBar=inject(NotificationService)
  private questionEtapeService=inject(QuestionEtapeService)
  listeQuestions=signal<questionPourEtapeResponseDto[]>([])
  constructor(){
    this.nomProjet = localStorage.getItem('activeProjetNom') || 'Waati Delivery';
    this.etapeServive.getAllEtapes().subscribe({
        next:(donnees)=>{
          console.log(donnees.values())
                  this.listeEtapes.set(donnees)
        },
        error:(erreur)=>{
            console.log(erreur)
        }
    })
  }
  public CommencerEtapes(id:string,nom_etape:string){
    const projetEtapeRequest:projetEtapeRequestDto={
        projetId:localStorage.getItem("activeProjetId")!,
        etape_id:id
    }

       this.projetEtapeService.commcerEtape(projetEtapeRequest).subscribe(
        {
              next:(donnee)=>{
                    this.messageSnakBar.succes("etape"+ nom_etape+ "commencé avec succes!")
                    this.questionEtapeService.getQuestionForEtapeDonnee(id).subscribe({
                       next:(donnees)=>{
                           this.listeQuestions.set(donnees)
                          
                       },
                       error:(erreur)=>{
                         console.log(erreur)
                       }
                    })
              },
              error:(erreur)=>{
                  console.log(erreur)
              }

        }
       )

  }

}
