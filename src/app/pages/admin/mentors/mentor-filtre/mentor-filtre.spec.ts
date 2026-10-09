import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorFiltre } from './mentor-filtre';

describe('MentorFiltre', () => {
  let component: MentorFiltre;
  let fixture: ComponentFixture<MentorFiltre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorFiltre],
    }).compileComponents();

    fixture = TestBed.createComponent(MentorFiltre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
