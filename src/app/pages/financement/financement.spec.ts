import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Financement } from './financement';

describe('Financement', () => {
  let component: Financement;
  let fixture: ComponentFixture<Financement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Financement],
    }).compileComponents();

    fixture = TestBed.createComponent(Financement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
