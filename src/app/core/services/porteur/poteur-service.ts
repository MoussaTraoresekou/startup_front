import { inject, Injectable } from '@angular/core';
import { MentorResponseDto } from '../../model/MentorResponseDto';
import { HttpClient } from '@angular/common/http';
import { InvitationMentorDto } from '../../model/InvitationMentorDto';

@Injectable({
  providedIn: 'root',
})
export class PoteurService {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api/porteur';
  getAllMentor(){
     return this.http.get<MentorResponseDto[]>(`${this.baseUrl}/mentors`);
  }
  solliciterMentor(invitation: InvitationMentorDto) {
    return this.http.post<{ message: string }>(`${this.baseUrl}/solliciter-mentor`, invitation);
  }
}
