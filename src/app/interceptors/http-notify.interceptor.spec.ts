import { TestBed } from '@angular/core/testing';

import { HttpNotifyInterceptor } from './http-notify.interceptor';

describe('HttpNotifyInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      HttpNotifyInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: HttpNotifyInterceptor = TestBed.inject(HttpNotifyInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
