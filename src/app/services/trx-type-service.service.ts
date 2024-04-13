import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EditTrxTypeRequest, NewTrxTypeRequest, TrxTypeViewModel } from './models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrxTypeServiceService {

  constructor(private httpClient: HttpClient) { }

  private getBaseUrl(): string {
    return `${environment.baseApi}/api/SpendTypes`;
  }

  public newTrxType(request: NewTrxTypeRequest): Observable<TrxTypeViewModel> {
    const url = this.getBaseUrl();
    const params = new HttpParams().set('entireResponse', true);
    return this.httpClient.post<TrxTypeViewModel>(url, request, { params: params });
  }

  public editTrxType(request: EditTrxTypeRequest): Observable<TrxTypeViewModel> {
    const url = this.getBaseUrl();
    const params = new HttpParams().set('entireResponse', true);
    return this.httpClient.patch<TrxTypeViewModel>(url, request, { params: params });
  }

  public getAllTransactionTypes(): Observable<TrxTypeViewModel[]> {
    const url = this.getBaseUrl();
    return this.httpClient.get<TrxTypeViewModel[]>(url);
  }

  public changeTrxTypeUserSelected(trxTypeId: number, newIsSelected: boolean): Observable<number[]> {
    const url = `${this.getBaseUrl()}/${trxTypeId}/user`;
    let method: Observable<number[]>;
    if (newIsSelected) {
      method = this.httpClient.post<number[]>(url, null);
    }
    else {
      method = this.httpClient.delete<number[]>(url)
    }

    return method;
  }
}
