import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { roleGhardGuard } from './role-ghard-guard';

describe('roleGhardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => roleGhardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
