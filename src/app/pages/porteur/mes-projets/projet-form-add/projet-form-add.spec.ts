import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetFormAdd } from './projet-form-add';

describe('ProjetFormAdd', () => {
  let component: ProjetFormAdd;
  let fixture: ComponentFixture<ProjetFormAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetFormAdd],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjetFormAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
