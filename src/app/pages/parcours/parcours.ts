import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  private projetEtapeService = inject(ProjetEtapeService);
  private etapeServive = inject(EtapeService);
  private questionEtapeService = inject(QuestionEtapeService);
  messageSnakBar = inject(NotificationService);

  nomProjet: string = 'Waati Delivery';
  projetId!: number;
  
  listeEtapes = signal<EtapeResponseDto[]>([]);
  listeQuestions = signal<questionPourEtapeResponseDto[]>([]);
  
  etapeSelectionnee = signal<EtapeResponseDto | null>(null);
  questionSelectionnee = signal<questionPourEtapeResponseDto | null>(null);
  
  texteReponse: string = '';
  reponseExistante: boolean = false;
  modeEditionActive: boolean = false;

  ngOnInit(): void {
    this.nomProjet = localStorage.getItem('activeProjetNom') || 'Waati Delivery';
    
    // Extraction sécurisée de l'ID du projet parent depuis la route active
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    this.projetId = parseInt(idParam || '0', 10);

    this.etapeServive.getAllEtapes().subscribe({
      next: (donnees: EtapeResponseDto[]) => {
        this.listeEtapes.set(donnees);
        
        if (donnees && donnees.length > 0) {
          this.etapeSelectionnee.set(donnees[0]); 
          this.chargerQuestionsDeLEtape(donnees[0].id.toString());
        }
      },
      error: (erreur) => {
        console.error("Erreur lors de la récupération des étapes :", erreur);
      }
    });
  }

  public CommencerEtapes(id: string, nom_etape: string, etapeObjet: EtapeResponseDto) {
    this.etapeSelectionnee.set(etapeObjet);
    this.annulerEdition();

    const projetEtapeRequest: projetEtapeRequestDto = {
      projetId: localStorage.getItem("activeProjetId")!,
      etape_id: id
    };

    this.projetEtapeService.commcerEtape(projetEtapeRequest).subscribe({
      next: () => {
        this.messageSnakBar.succes("L'étape " + nom_etape + " a été commencée avec succès !");
        this.chargerQuestionsDeLEtape(id);
      },
      error: (erreur) => {
        console.error("Erreur lors du démarrage de l'étape :", erreur);
      }
    });
  }

  public ouvrirLectureQuestion(question: questionPourEtapeResponseDto): void {
    this.modeEditionActive = false;
    this.questionSelectionnee.set(question);
  }

  public activerModeEdition(question: questionPourEtapeResponseDto): void {
    this.questionSelectionnee.set(question);
    this.modeEditionActive = true;
    
    this.texteReponse = question.reposonse_donnee || '';
    this.reponseExistante = !!question.reposonse_donnee;
  }

  public annulerEdition(): void {
    this.questionSelectionnee.set(null);
    this.modeEditionActive = false;
    this.texteReponse = '';
  }

  /**
   * Enregistre la réponse et coche instantanément le rond vert via l'URL d'API par PathVariable 🟢
   */
  public enregistrerReponse(): void {
    if (!this.texteReponse.trim() || !this.questionSelectionnee() || !this.etapeSelectionnee()) {
      return;
    }

    const questionActive = this.questionSelectionnee()!;
    const etapeActive = this.etapeSelectionnee()!;

    // 1. MISE À JOUR VISUELLE LOCALE IMMEDIATE : Évite d'attendre la latence réseau pour passer au vert
    this.listeQuestions.update(questions => {
      return questions.map(q => {
        if (q.id === questionActive.id) {
          return { ...q, reposonse_donnee: this.texteReponse };
        }
        return q;
      });
    });

    // 2. Envoi effectif vers la route exacte du serveur Spring Boot [1.6]
    this.questionEtapeService.sauvegarderReponseExacte(
      etapeActive.id, 
      questionActive.id, 
      this.texteReponse
    ).subscribe({
      next: () => {
        this.messageSnakBar.succes(this.reponseExistante ? "Modification enregistrée avec succès !" : "Réponse enregistrée avec succès !");
        this.annulerEdition();
        
        // 3. Synchronisation finale de contrôle avec votre base de données relationnelle
        this.chargerQuestionsDeLEtape(etapeActive.id.toString());
      },
      error: (erreur) => {
        console.error("Erreur d'enregistrement sur Spring Boot :", erreur);
        this.messageSnakBar.succes("Erreur lors de la sauvegarde sur le serveur.");
      }
    });
  }

  private chargerQuestionsDeLEtape(etapeId: string): void {
    // Appel d'acquisition couplant l'étape et le projet actif requis par le Repository [1.6]
    this.questionEtapeService.getQuestionForEtapeDonnee(etapeId, this.projetId).subscribe({
      next: (donnees) => {
        this.listeQuestions.set(donnees);
      },
      error: (erreur) => {
        console.error("Erreur lors du chargement des questions :", erreur);
      }
    });
  }
}
