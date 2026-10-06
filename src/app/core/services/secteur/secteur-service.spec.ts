import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecteurService } from './secteur-service';

describe('SecteurService', () => {
  let component: SecteurService;
  let fixture: ComponentFixture<SecteurService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecteurService],
    }).compileComponents();

    fixture = TestBed.createComponent(SecteurService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
