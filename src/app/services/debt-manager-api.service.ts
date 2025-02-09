import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddDebtRequestVm, DebtRequestVm, NewDebtRequest } from './models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DebtManagerApiService {

  constructor(private httpClient: HttpClient) { }

  public updateCreditorStatus(debtRequestId: number, status: number): Observable<DebtRequestVm> {
    return this.httpClient.put<DebtRequestVm>(`${environment.baseApi}/api/debtRequests/${debtRequestId}/creditor/status`, { status });
  }

  public updateDebtorStatus(debtRequestId: number, status: number): Observable<DebtRequestVm> {
    return this.httpClient.put<DebtRequestVm>(`${environment.baseApi}/api/debtRequests/${debtRequestId}/debtor/status`, { status });
  }

  public getDebtsRequests(): Observable<DebtRequestVm[]> {
    return this.httpClient.get<DebtRequestVm[]>(`${environment.baseApi}/api/debtRequests`);
  }

  public getDataToAddDebtRequest(): Observable<AddDebtRequestVm> {
    return this.httpClient.get<AddDebtRequestVm>(`${environment.baseApi}/api/debtRequests/add`);
  }

  public submitDebtRequest(model: NewDebtRequest): Observable<DebtRequestVm> {
    return this.httpClient.post<DebtRequestVm>(`${environment.baseApi}/api/debtRequests`, model);
  }
}
