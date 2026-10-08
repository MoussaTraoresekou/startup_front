import { TestBed } from '@angular/core/testing';

import { ProjetEtapeService } from './projet-etape-service';

describe('ProjetEtapeService', () => {
  let service: ProjetEtapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjetEtapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
