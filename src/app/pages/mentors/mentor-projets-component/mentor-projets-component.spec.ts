import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorProjetsComponent } from './mentor-projets-component';

describe('MentorProjetsComponent', () => {
  let component: MentorProjetsComponent;
  let fixture: ComponentFixture<MentorProjetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorProjetsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MentorProjetsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
