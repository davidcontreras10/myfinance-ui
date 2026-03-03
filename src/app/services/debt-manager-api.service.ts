import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddDebtRequestVm, DebtRequestAppTrx, DebtRequestVm, ItemModifiedRes, NewDebtRequest, SelectableItem } from './models';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DebtManagerApiService {

  constructor(private httpClient: HttpClient) { }

  public deleteAllDebtRequestAppTrxs(debtRequestId: number): Observable<void> {
    return this.httpClient.delete<void>(`${environment.baseApi}/api/debtRequests/${debtRequestId}/app-trxs`);
  }

  public getDebtRequestAppTrxs(debtRequestId: number): Observable<DebtRequestAppTrx[]> {
    return this.httpClient.get<DebtRequestAppTrx[]>(`${environment.baseApi}/api/debtRequests/${debtRequestId}/app-trxs`);
  }

  public addTransactionsToDebtRequest(debtRequestId: number, transactions: DebtRequestAppTrx[]): Observable<ItemModifiedRes[]> {
    const url = `${environment.baseApi}/api/debtRequests/${debtRequestId}/app-trxs`;
    return this.httpClient.post<ItemModifiedRes[]>(url, transactions);
  }

  public getAccountsForAddingTrx(currencyId: number): Observable<SelectableItem[]> {
    const url = `${environment.baseApi}/api/accounts/currencies/addition?sourceCurrencyIds=${currencyId}`;
    const apiResult = this.httpClient.get<{ currencyId: number, accounts: SelectableItem[] }[]>(url);
    return apiResult.pipe(
      map(items => items.find(item => item.currencyId === currencyId)?.accounts || [])
    );
  }

  public updateCreditorStatus(debtRequestId: number, status: number): Observable<DebtRequestVm> {
    return this.httpClient.put<DebtRequestVm>(`${environment.baseApi}/api/debtRequests/${debtRequestId}/creditor/status`, { status, dateTime: new Date() });
  }

  public updateDebtorStatus(debtRequestId: number, status: number): Observable<DebtRequestVm> {
    return this.httpClient.put<DebtRequestVm>(`${environment.baseApi}/api/debtRequests/${debtRequestId}/debtor/status`, { status, dateTime: new Date() });
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
