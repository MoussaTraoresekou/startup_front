import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltreSecteur } from './filtre-secteur';

describe('FiltreSecteur', () => {
  let component: FiltreSecteur;
  let fixture: ComponentFixture<FiltreSecteur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltreSecteur],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltreSecteur);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
