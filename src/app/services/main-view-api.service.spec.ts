import { TestBed } from '@angular/core/testing';

import { MainViewApiService } from './main-view-api.service';

describe('MainViewServiceService', () => {
  let service: MainViewApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainViewApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
