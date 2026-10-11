import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetCard } from './projet-card';

describe('ProjetCard', () => {
  let component: ProjetCard;
  let fixture: ComponentFixture<ProjetCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjetCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
