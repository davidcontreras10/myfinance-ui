import { TestBed } from '@angular/core/testing';

import { AccountViewModelService } from './account-view-model.service';

describe('AccountViewModelService', () => {
  let service: AccountViewModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountViewModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
