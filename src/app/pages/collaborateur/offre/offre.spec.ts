import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Offre } from './offre';

describe('Offre', () => {
  let component: Offre;
  let fixture: ComponentFixture<Offre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Offre],
    }).compileComponents();

    fixture = TestBed.createComponent(Offre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
