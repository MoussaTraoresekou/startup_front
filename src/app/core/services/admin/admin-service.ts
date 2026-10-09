import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MentorResponseDto } from '../../model/MentorResponseDto';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api/admin';
  getAllMentor(){
     return this.http.get<MentorResponseDto[]>(`${this.baseUrl}/mentors`);
  }
  validerMentor(id:number){
       return this.http.put<MentorResponseDto>(`${this.baseUrl}/mentors/${id}/valider`,id);
  }
  refuserMentor(id:number){
       return this.http.put<MentorResponseDto>(`${this.baseUrl}/mentors/${id}/refuser`,id);
  }
}
