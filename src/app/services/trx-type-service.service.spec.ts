import { TestBed } from '@angular/core/testing';

import { TrxTypeServiceService } from './trx-type-service.service';

describe('TrxTypeServiceService', () => {
  let service: TrxTypeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrxTypeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
