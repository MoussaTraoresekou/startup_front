import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { commencerEtapeReponseDto } from '../../../core/model/commencerEtapeReponseDto';
import { FichierService } from '../../../core/services/fichier_telecharger/fichier-service';
import { EtapeService } from '../../../core/services/etape/etape-service';
import { ProjetEtapeService } from '../../../core/services/ProjetEtape/projet-etape-service';
import { QuestionEtapeService } from '../../../core/services/question_etape/question-etape-service';
import { NotificationService } from '../../../core/services/notification-service';
import { questionPourEtapeResponseDto } from '../../../core/model/questionPourEtapeResponseDto';
import { projetEtapeRequestDto } from '../../../core/model/projetEtapeRequestDto';


interface EtapeAffichageDto extends commencerEtapeReponseDto {
  etapeId: number; // ID technique fixe (1, 2, 3...) pour charger les questions
}

@Component({
  selector: 'app-parcours',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatIconModule, 
    MatButtonModule
  ],
  templateUrl: './parcours.html',
  styleUrls: ['./parcours.css']
})
export class Parcours implements OnInit {
  private route = inject(ActivatedRoute);
  private telechargerFichier_service = inject(FichierService);

  private etapeService = inject(EtapeService);
  private projetEtapeService = inject(ProjetEtapeService);
  private questionEtapeService = inject(QuestionEtapeService);
  messageSnakBar = inject(NotificationService);

  nomProjet!: string ;
  projetId!: number;
  
  listeEtapes = signal<EtapeAffichageDto[]>([]);
  listeQuestions = signal<questionPourEtapeResponseDto[]>([]);
  
  etapeSelectionnee = signal<EtapeAffichageDto | null>(null);
  questionSelectionnee = signal<questionPourEtapeResponseDto | null>(null);
  
  texteReponse: string = '';
  reponseExistante: boolean = false;

  ngOnInit(): void {
    this.nomProjet = localStorage.getItem('activeProjetNom') || 'Waati Delivery';
    
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    this.projetId = parseInt(idParam || '0', 10);

    this.etapeService.getAllEtapes().subscribe({
      next: (donnees) => {
        const etapesInitialisees: EtapeAffichageDto[] = donnees.map(e => ({
          id: 0,
          etapeId: e.id,
          etape: e.nom_etape,
          StatutEtape: '', 
          dateSoumission: '',
          dateValidation: '',
          commentaireMentor: '',
          document_url: ''
        }));

        this.listeEtapes.set(etapesInitialisees);
        
        if (etapesInitialisees.length > 0) {
          this.cliquerSurEtape(etapesInitialisees[0]);
        }
      },
      error: (erreur) => console.error("Erreur d'acquisition des étapes :", erreur)
    });
  }

  public cliquerSurEtape(etapeObjet: EtapeAffichageDto): void {
    this.etapeSelectionnee.set(etapeObjet);
    this.annulerEdition();

    if (!etapeObjet.StatutEtape) {
      this.CommencerEtapes(etapeObjet.etapeId.toString(), etapeObjet.etape, etapeObjet);
    } else {
      this.chargerQuestionsDeLEtape(etapeObjet.etapeId.toString());
    }
  }

  public CommencerEtapes(idFixe: string, nom_etape: string, etapeObjet: EtapeAffichageDto) {
    const projetEtapeRequest: projetEtapeRequestDto = {
      projetId: this.projetId.toString(),
      etape_id: idFixe
    };

    this.projetEtapeService.commcerEtape(projetEtapeRequest).subscribe({
      next: (reponseFreshDto: commencerEtapeReponseDto) => {
        this.messageSnakBar.succes("L'étape " + nom_etape + " est lancée !");
        
        const etapeMiseAJour: EtapeAffichageDto = {
          ...reponseFreshDto,
          etapeId: etapeObjet.etapeId 
        };

        this.etapeSelectionnee.set(etapeMiseAJour);

        this.listeEtapes.update(etapes => 
          etapes.map(e => e.etapeId === etapeObjet.etapeId ? etapeMiseAJour : e)
        );

        this.chargerQuestionsDeLEtape(idFixe);
      },
      error: (erreur) => console.error("Erreur lors du démarrage de l'étape :", erreur)
    });
  }

  public ouvrirFormulaireSaisieDirecte(question: questionPourEtapeResponseDto): void {
    this.questionSelectionnee.set(question);
    this.texteReponse = question.reponse_donnee || '';
    this.reponseExistante = !!question.reponse_donnee;
  }

  public annulerEdition(): void {
    this.questionSelectionnee.set(null);
    this.texteReponse = '';
    this.reponseExistante = false;
  }

  public enregistrerReponse(): void {
    if (!this.texteReponse.trim() || !this.questionSelectionnee() || !this.etapeSelectionnee()) {
      return;
    }

    const questionActive = this.questionSelectionnee()!;
    const etapeActive = this.etapeSelectionnee()!;

    this.listeQuestions.update(questions => {
      return questions.map(q => q.id === questionActive.id ? { ...q, reposonse_donnee: this.texteReponse } : q);
    });

    this.questionEtapeService.sauvegarderReponseExacte(
      etapeActive.id, 
      questionActive.id, 
      this.texteReponse
    ).subscribe({
      next: () => {
        this.messageSnakBar.succes(this.reponseExistante ? "Modification enregistrée avec succès !" : "Réponse enregistrée avec succès !");
        this.annulerEdition();
        this.chargerQuestionsDeLEtape(etapeActive.etapeId.toString());
      },
      error: (erreur) => {
        console.error("Erreur de sauvegarde Spring Boot :", erreur);
        this.messageSnakBar.succes("Erreur lors de la sauvegarde sur le serveur.");
      }
    });
  }

  private chargerQuestionsDeLEtape(idFixe: string): void {
    this.questionEtapeService.getQuestionForEtapeDonnee(idFixe, this.projetId).subscribe({
      next: (donnees) => this.listeQuestions.set(donnees),
      error: (erreur) => console.error(erreur)
    });
  }
    
  public telechargerLeDocument(): void {
    const etapeActive = this.etapeSelectionnee();
    if (!etapeActive || !etapeActive.id) {
      this.messageSnakBar.succes("Impossible de télécharger : l'étape n'est pas initialisée.");
      return;
    }
    this.telechargerFichier_service.telechargerLivrableFichier(etapeActive.id).subscribe({
      next: (blobBinaire: Blob) => {
        const urlFichierEnMemoire = window.URL.createObjectURL(blobBinaire);
                const lienInvisible = document.createElement('a');
        lienInvisible.href = urlFichierEnMemoire;
        lienInvisible.download = `Livrable_Projet_Etape_${etapeActive.id}.txt`;
        document.body.appendChild(lienInvisible);
        lienInvisible.click();
                document.body.removeChild(lienInvisible);
        window.URL.revokeObjectURL(urlFichierEnMemoire);
        this.messageSnakBar.succes("Le livrable a été téléchargé avec succès !");
      },
      error: (erreur) => {
        console.error("Échec du téléchargement du livrable :", erreur);
        this.messageSnakBar.succes("Erreur : Assurez-vous de répondre à toutes les questions avant de télécharger.");
      }
    });
  }

}
