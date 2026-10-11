import { TestBed } from '@angular/core/testing';

import { MentorServices } from './mentor-services';

describe('MentorServices', () => {
  let service: MentorServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MentorServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
