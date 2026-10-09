import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorListe } from './mentor-liste';

describe('MentorListe', () => {
  let component: MentorListe;
  let fixture: ComponentFixture<MentorListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorListe],
    }).compileComponents();

    fixture = TestBed.createComponent(MentorListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
