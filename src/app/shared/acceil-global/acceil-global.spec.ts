import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceilGlobal } from './acceil-global';

describe('AcceilGlobal', () => {
  let component: AcceilGlobal;
  let fixture: ComponentFixture<AcceilGlobal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceilGlobal],
    }).compileComponents();

    fixture = TestBed.createComponent(AcceilGlobal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
