import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPorteur } from './register-porteur';

describe('RegisterPorteur', () => {
  let component: RegisterPorteur;
  let fixture: ComponentFixture<RegisterPorteur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPorteur],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPorteur);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
