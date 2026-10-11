import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorDasboard } from './mentor-dasboard';

describe('MentorDasboard', () => {
  let component: MentorDasboard;
  let fixture: ComponentFixture<MentorDasboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorDasboard],
    }).compileComponents();

    fixture = TestBed.createComponent(MentorDasboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
