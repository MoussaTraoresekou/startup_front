import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidbarLayout } from './sidbar-layout';

describe('SidbarLayout', () => {
  let component: SidbarLayout;
  let fixture: ComponentFixture<SidbarLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidbarLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(SidbarLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
