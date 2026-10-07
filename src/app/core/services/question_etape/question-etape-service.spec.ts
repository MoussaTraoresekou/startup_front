import { TestBed } from '@angular/core/testing';

import { QuestionEtapeService } from './question-etape-service';

describe('QuestionEtapeService', () => {
  let service: QuestionEtapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionEtapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
