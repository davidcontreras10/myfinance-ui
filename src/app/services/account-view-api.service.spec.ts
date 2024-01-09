import { TestBed } from '@angular/core/testing';

import { AccountViewApiService as AccountViewApiService } from './account-view-api.service';

describe('AccountViewService', () => {
  let service: AccountViewApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountViewApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
