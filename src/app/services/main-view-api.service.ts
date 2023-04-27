import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AccountGroup } from '../main-view/models';
import { environment } from 'src/environments/environment';
import { FinanceAccountRequest, FinanceAccountResponse } from './models';

@Injectable({
  providedIn: 'root'
})
export class MainViewApiService {

  constructor(private httpClient: HttpClient) { }

  public loadMainAccountGroups(): Observable<AccountGroup[]> {
    return this.httpClient.get<any>(`${environment.baseApi}/api/Accounts/user`).pipe(
      map(res => res.accountGroupMainViewViewModels)
    );
  }

  public loadAccountFinanance(accountPerioIds: number[], isPending: boolean): Observable<FinanceAccountResponse[]> {
    const requests: FinanceAccountRequest[] = [];
    accountPerioIds.forEach(accpId => {
      requests.push({
        accountPeriodId: accpId,
        amountTypeId: 0,
        loanSpends: false,
        pendingSpends: isPending
      })
    });

    return this.httpClient.post<FinanceAccountResponse[]>(`${environment.baseApi}/api/Accounts/finance`, requests);
  }
}
