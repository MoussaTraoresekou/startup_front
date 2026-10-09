import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesProjets } from './mes-projets';

describe('MesProjets', () => {
  let component: MesProjets;
  let fixture: ComponentFixture<MesProjets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesProjets],
    }).compileComponents();

    fixture = TestBed.createComponent(MesProjets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
