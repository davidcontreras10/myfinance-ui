import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrxTypeViewModel } from './models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrxTypeServiceService {

  constructor(private httpClient: HttpClient) { }

  private getBaseUrl(): string {
    return `${environment.baseApi}/api/SpendTypes`;
  }

  public getAllTransactionTypes(): Observable<TrxTypeViewModel[]> {
    const url = this.getBaseUrl();
    return this.httpClient.get<TrxTypeViewModel[]>(url);
  }

}
