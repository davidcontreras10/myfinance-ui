import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiCredentials, TokenResponse } from './models';
import { Observable, map, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) { }

  public getToken(credentials: ApiCredentials): Observable<any> {
    return this.http.post(`${environment.baseApi}/api/Authentication`, credentials).pipe(
      tap((res) => {
        console.log('API Res:', res);
      })
    )
  }
}
