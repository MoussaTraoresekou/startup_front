import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborateurDashboard } from './collaborateur-dashboard';

describe('CollaborateurDashboard', () => {
  let component: CollaborateurDashboard;
  let fixture: ComponentFixture<CollaborateurDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaborateurDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(CollaborateurDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
