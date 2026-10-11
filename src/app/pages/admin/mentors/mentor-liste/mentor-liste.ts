import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MentorResponseDto } from '../../../../core/model/MentorResponseDto';
import { MentorDetail } from '../mentor_detail/mentor-detail';
import { Mentor } from '../mentor';

@Component({
  selector: '[app-mentor-liste]',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './mentor-liste.html',
  styleUrl: './mentor-liste.css',
})
export class MentorListe {
  mentor = input.required<MentorResponseDto>();
  conculterOnClick=output<MentorResponseDto>()

  consulterDetails(mentor: MentorResponseDto) {
    this.conculterOnClick.emit(mentor)
  }
  
  approuverMentor(id: number) {
    alert('Approbation ID : ' + id);
  }
  
  rejeterMentor(id: number) {
    alert('Refus ID : ' + id);
  }
}
