import { TestBed } from '@angular/core/testing';

import { AutoTasksApiService } from './auto-tasks-api.service';

describe('AutoTasksApiService', () => {
  let service: AutoTasksApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoTasksApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
