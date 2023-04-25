import { Injectable } from '@angular/core';
import { TokenResponse } from './services/models';

const TOKEN_KEY = 'jwtToken'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }

  public isAuthenticated(): boolean {
    const tokenObject = this.readStoredToken();
    if (tokenObject && tokenObject.accessToken && tokenObject.expireDate) {
      const expireDate = new Date(tokenObject.expireDate);
      return new Date() < expireDate;
    }

    localStorage.removeItem(TOKEN_KEY);
    return false;
  }

  public getToken(): string | null {
    return this.readStoredToken()?.accessToken;
  }

  public authenticate(token: TokenResponse) {
    if (token && token.accessToken) {
      let expireDate = new Date();
      this.addSeconds(expireDate, token.expiresIn);
      const tokenObject = {
        accessToken: token.accessToken,
        expireDate: expireDate
      }

      const strObject = JSON.stringify(tokenObject);
      localStorage.setItem(TOKEN_KEY, strObject);
    }
  }

  public logout() {
    localStorage.removeItem(TOKEN_KEY);
  }

  private readStoredToken(): any | null {
    const strObject = localStorage.getItem(TOKEN_KEY);
    if (strObject) {
      return this.getSafeJson(strObject);
    }

    return null;
  }

  private addSeconds(date: Date, seconds: number): void {
    date.setSeconds(date.getSeconds() + seconds);
  }

  private getSafeJson(value: string): any {
    try {
      return JSON.parse(value);
    }
    catch {
      return null;
    }
  }
}
