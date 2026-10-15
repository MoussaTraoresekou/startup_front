import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcosystemeLayout } from './ecosysteme-layout';

describe('EcosystemeLayout', () => {
  let component: EcosystemeLayout;
  let fixture: ComponentFixture<EcosystemeLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcosystemeLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(EcosystemeLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
