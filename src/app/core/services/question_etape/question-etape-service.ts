import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { questionPourEtapeResponseDto } from '../../model/questionPourEtapeResponseDto';

@Injectable({
  providedIn: 'root',
})
export class QuestionEtapeService {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api';
  getQuestionForEtapeDonnee(id:string){
    return this.http.get<questionPourEtapeResponseDto[]>(`${this.baseUrl}/porteur/etapes/${id}/questions`)
  }


}
