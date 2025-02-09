import { TestBed } from '@angular/core/testing';

import { DebtManagerApiService } from './debt-manager-api.service';

describe('DebtManagerApiService', () => {
  let service: DebtManagerApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DebtManagerApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
