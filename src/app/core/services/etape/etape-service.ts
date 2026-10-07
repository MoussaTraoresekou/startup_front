import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environnement/environnement';
import { EtapeResponseDto } from '../../model/EtapeResponseDto';

@Injectable({
  providedIn: 'root',
})
export class EtapeService {
  private http=inject(HttpClient)
  private baseUrl=environment.baseUrl.toString()
  private baseUrl1 = 'http://localhost:8080/api';


  getAllEtapes(){
    return this.http.get<EtapeResponseDto[]>(`${this.baseUrl1}/etape`)
  }

}
