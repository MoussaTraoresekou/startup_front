import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonProjet } from './mon-projet';

describe('MonProjet', () => {
  let component: MonProjet;
  let fixture: ComponentFixture<MonProjet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonProjet],
    }).compileComponents();

    fixture = TestBed.createComponent(MonProjet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
