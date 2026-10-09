import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RegisterMentorRequest } from '../../model/RegisterMentorRequest ';
import { MentorResponseDto } from '../../model/MentorResponseDto';

@Injectable({
  providedIn: 'root',
})
export class MentorServices {
  private http=inject(HttpClient)
  private baseUrl = 'http://localhost:8080/api/mentor';
  registerMentor(mentor: RegisterMentorRequest){
    return this.http.post<MentorResponseDto>(`${this.baseUrl}/register`,mentor)
  }
}
