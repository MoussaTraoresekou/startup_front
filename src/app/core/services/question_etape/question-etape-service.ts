import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { questionPourEtapeResponseDto } from '../../model/questionPourEtapeResponseDto';
import { ReponseQuestionDto } from '../../model/ReponseQuestionDto';
import { ReponseResponseDto } from '../../model/ReponseResponseDto';

@Injectable({
  providedIn: 'root',
})
export class QuestionEtapeService {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api';
getQuestionForEtapeDonnee(etapeId: string, projetId: number) {
  return this.http.get<questionPourEtapeResponseDto[]>(`${this.baseUrl}/porteur/etapes/${etapeId}/questions?projetId=${projetId}`);
}

sauvegarderReponseExacte(projetEtapeId: number, questionId: number, texteReponse: string) {
    const payload: ReponseQuestionDto = {
      reponse: texteReponse
    };
    return this.http.put<ReponseResponseDto>(
      `${this.baseUrl}/porteur/projetEtape/${projetEtapeId}/questions/${questionId}/repondre`, 
      payload
    );
  }



}
