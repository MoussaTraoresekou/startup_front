import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authGhardGuard } from './auth-ghard-guard';

describe('authGhardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGhardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
