import { TestBed } from '@angular/core/testing';

import { NavBarServiceService } from './nav-bar-service.service';

describe('NavBarServiceService', () => {
  let service: NavBarServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavBarServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
