import { TestBed } from '@angular/core/testing';

import { AccountViewService } from './account-view.service';

describe('AccountViewService', () => {
  let service: AccountViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
