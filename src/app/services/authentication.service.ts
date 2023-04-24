import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiCredentials, TokenResponse } from './models';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) { }

  public getToken(credentials: ApiCredentials): Observable<TokenResponse> {
    return this.http.post<any>(`${environment.baseApi}/api/Authentication`, credentials).pipe(
      map(response => {
        return {
          accessToken: response.accessToken,
          expiresIn: response.expiresIn
        }
      })
    )
  }
}
