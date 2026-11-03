import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SchedulingPreferences {
  timeZoneId: string;
}

@Injectable({ providedIn: 'root' })
export class SchedulingPreferencesApiService {
  private readonly url = `${environment.baseApi}/api/Users/@current/scheduling-preferences`;

  constructor(private http: HttpClient) { }

  get(): Observable<SchedulingPreferences> {
    return this.http.get<SchedulingPreferences>(this.url);
  }

  update(timeZoneId: string): Observable<SchedulingPreferences> {
    return this.http.put<SchedulingPreferences>(this.url, { timeZoneId });
  }
}
