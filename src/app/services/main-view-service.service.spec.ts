import { TestBed } from '@angular/core/testing';

import { MainViewServiceService } from './main-view-service.service';

describe('MainViewServiceService', () => {
  let service: MainViewServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainViewServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
