import { TestBed } from '@angular/core/testing';

import { HttpEventNotifierService } from './http-event-notifier.service';

describe('HttpEventNotifierService', () => {
  let service: HttpEventNotifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpEventNotifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
