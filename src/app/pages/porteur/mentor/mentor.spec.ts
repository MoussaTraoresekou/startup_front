import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mentor } from './mentor';

describe('Mentor', () => {
  let component: Mentor;
  let fixture: ComponentFixture<Mentor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mentor],
    }).compileComponents();

    fixture = TestBed.createComponent(Mentor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
