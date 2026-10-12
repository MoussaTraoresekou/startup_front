import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivrableDetailModalComponent } from './livrable-detail-modal-component';

describe('LivrableDetailModalComponent', () => {
  let component: LivrableDetailModalComponent;
  let fixture: ComponentFixture<LivrableDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivrableDetailModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LivrableDetailModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
