import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { SchedulingPreferencesApiService } from './scheduling-preferences-api.service';

describe('SchedulingPreferencesApiService', () => {
  let service: SchedulingPreferencesApiService;
  let http: HttpTestingController;
  const url = `${environment.baseApi}/api/Users/@current/scheduling-preferences`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SchedulingPreferencesApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads the authenticated user preference without a client-supplied identity', () => {
    service.get().subscribe(result => expect(result.timeZoneId).toBe('America/Costa_Rica'));
    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual([]);
    request.flush({ timeZoneId: 'America/Costa_Rica' });
  });

  it('sends only the explicitly selected timezone and reads the saved result', () => {
    service.update('Asia/Kathmandu').subscribe(result => expect(result.timeZoneId).toBe('Asia/Katmandu'));
    const request = http.expectOne(url);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ timeZoneId: 'Asia/Kathmandu' });
    request.flush({ timeZoneId: 'Asia/Katmandu' });
  });

  it('preserves disabled-feature failures instead of inventing a saved default', () => {
    service.get().subscribe({ next: () => fail('Expected disabled feature'), error: error => expect(error.status).toBe(503) });
    http.expectOne(url).flush({}, { status: 503, statusText: 'Service Unavailable' });
  });
});
