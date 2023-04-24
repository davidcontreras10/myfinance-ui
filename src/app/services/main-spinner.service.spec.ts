import { TestBed } from '@angular/core/testing';

import { MainSpinnerService } from './main-spinner.service';

describe('MainSpinnerService', () => {
  let service: MainSpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainSpinnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
