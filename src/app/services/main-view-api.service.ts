import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AccountGroup, BankGroups } from '../main-view/models';
import { environment } from 'src/environments/environment';
import { FinanceAccountRequest, FinanceAccountResponse, FinancialSummaryAccount } from './models';

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

  public loadAccountFinanceSummary(): Observable<BankGroups[]> {
    const headers = new HttpHeaders({
      'x-skip-interceptor': 'true'
    });
    return this.httpClient.get<FinancialSummaryAccount[]>(`${environment.baseApi}/api/Accounts/finance/summary`, { headers: headers }).pipe(
      map(accounts => {
        const banks: BankGroups[] = [];
        accounts.forEach((acc) => {
          let bankAcc = banks.find(b => b.financialEntityId == acc.financialEntityId);
          if (!bankAcc) {
            const name = acc.financialEntityId == null ? 'Others' : acc.financialEntityName
            bankAcc = {
              accounts: [],
              financialEntityName: name,
              financialEntityId: acc.financialEntityId
            }

            banks.push(bankAcc);
          }

          bankAcc.accounts.push(acc);
        });
        return banks;
      })
    );
  }
}
