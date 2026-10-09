import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorRegister } from './mentor-register';

describe('MentorRegister', () => {
  let component: MentorRegister;
  let fixture: ComponentFixture<MentorRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(MentorRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
