import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorDemandes } from './mentor-demandes';

describe('MentorDemandes', () => {
  let component: MentorDemandes;
  let fixture: ComponentFixture<MentorDemandes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorDemandes],
    }).compileComponents();

    fixture = TestBed.createComponent(MentorDemandes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
