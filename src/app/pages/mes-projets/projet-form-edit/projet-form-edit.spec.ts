import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetFormEdit } from './projet-form-edit';

describe('ProjetFormEdit', () => {
  let component: ProjetFormEdit;
  let fixture: ComponentFixture<ProjetFormEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetFormEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjetFormEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
