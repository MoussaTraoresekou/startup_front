import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesTaches } from './mes-taches';

describe('MesTaches', () => {
  let component: MesTaches;
  let fixture: ComponentFixture<MesTaches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesTaches],
    }).compileComponents();

    fixture = TestBed.createComponent(MesTaches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
