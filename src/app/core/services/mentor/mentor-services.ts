import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RegisterMentorRequest } from '../../model/RegisterMentorRequest ';
import { MentorResponseDto } from '../../model/MentorResponseDto';
import { ProjetDetailDto } from '../../model/ProjetDetailDto';

@Injectable({
  providedIn: 'root',
})
export class MentorServices {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api/mentor';
  registerMentor(mentor: RegisterMentorRequest){
    return this.http.post<MentorResponseDto>(`${this.baseUrl}/register`,mentor)
  }
  getAllDemandAcccompagnement(){
     return this.http.get<DemandeAccompagnement[]>(`${this.baseUrl}/demandes`)

  }
  getInfoProjet(id:number){
    return  this.http.get<ProjetDetailDto>(`${this.baseUrl}/projet/${id}`)
  }

  accepetAcompagnement(id:number){
       return this.http.put<{message:string}>(`${this.baseUrl}/mentor-projets/${id}/accepter`,id);
  }
  refuserAcompagnement(id:number){
       return this.http.put<{message:string}>(`${this.baseUrl}/mentor-projets/${id}/refuser`,id);
  }
}
