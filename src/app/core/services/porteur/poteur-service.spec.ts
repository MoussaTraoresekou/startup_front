import { TestBed } from '@angular/core/testing';

import { PoteurService } from './poteur-service';

describe('PoteurService', () => {
  let service: PoteurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoteurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
