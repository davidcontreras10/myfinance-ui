import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, filter, map } from 'rxjs';
import { AccountGroup, BalanceTypes, BankGroups, TransactionViewModel } from '../main-view/models';
import { environment } from 'src/environments/environment';
import { AddTransferResponse, AddTrxRequest, AddTrxResponse, FileResponse, FinanceAccountRequest, FinanceAccountResponse, FinancialSummaryAccount, ItemModifiedRes, SelectableItem, TransactionViewResponse } from './models';
import { Utils } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class MainViewApiService {

  constructor(private httpClient: HttpClient) { }

  public getAccountPeriodExcel(accountPeriodId: number): Observable<FileResponse> {
    return this.httpClient.get<FileResponse>(`${environment.baseApi}/api/AccountPeriods/${accountPeriodId}/excel`);
  }

  public submitTransfer(request: any): Observable<ItemModifiedRes[]> {
    return this.httpClient.post<ItemModifiedRes[]>(`${environment.baseApi}/api/Transfers`, request);
  }

  public getPossibleTransferDestAccounts(accountPeriodId: number, balanceType: BalanceTypes, currencyId?: number): Observable<SelectableItem[]> {
    const params = new HttpParams()
      .set('accountPeriodId', accountPeriodId)
      .set('currencyId', currencyId ? currencyId : 0)
      .set('balanceType', balanceType);
    return this.httpClient.get<SelectableItem[]>(`${environment.baseApi}/api/Transfers/possibleDestination`, { params: params });
  }

  public getTransferInfo(accountPeriodId: number): Observable<AddTransferResponse> {
    const params = new HttpParams()
      .set('accountPeriodId', accountPeriodId);
    return this.httpClient.get<AddTransferResponse>(`${environment.baseApi}/api/Transfers/basicAccountInfo`, { params: params });
  }

  public confirmPending(spendId: number, newDate: Date): Observable<ItemModifiedRes[]> {
    const params = new HttpParams()
      .set('spendId', spendId);
    const model = {
      newDateTime: Utils.toViewDateFormat(newDate)
    };
    return this.httpClient.put<ItemModifiedRes[]>(`${environment.baseApi}/api/spends/confirmation`, model, { params: params });
  }

  public updateSpend(spendId: number, model: any): Observable<ItemModifiedRes[]> {
    const params = new HttpParams()
      .set('spendId', spendId);
    return this.httpClient.patch<ItemModifiedRes[]>(`${environment.baseApi}/api/spends`, model, { params: params });
  }

  public getViewTransactionModel(accountPerioId: number, spendId: number): Observable<TransactionViewModel | null> {
    const params = new HttpParams()
      .set('spendId', spendId)
      .set('accountPerioId', accountPerioId);
    return this.httpClient.get<TransactionViewResponse[]>(`${environment.baseApi}/api/spends/edit`, { params: params }).pipe(
      map(items => {
        return items.find(item => item?.spendInfo?.spendId === spendId)
      }),
      map(item => {
        if (item) {

          let accountsIncluded = item.supportedAccountInclude.filter(x => x.amount);
          accountsIncluded.forEach(acc => {
            acc.selectedMethod = acc.methodIds.find(m => m.isDefault)
          })
          const response: TransactionViewModel = {
            accountName: item.accountName,
            accountsIncluded: accountsIncluded,
            originalAmount: item.spendInfo.originalAmount,
            selectedCurrency: item.supportedCurrencies.find(c => c.isSelected),
            selectedSpendTypeId: item.spendTypeViewModels.find(t => t.isSelected)?.id,
            spendDate: item.spendInfo.spendDate,
            spendId: item.spendInfo.spendId,
            spendTypeViewModels: item.spendTypeViewModels,
            setPaymentDate: item.spendInfo.setPaymentDate,
            description: item.spendInfo.description,
            isPending: item.spendInfo.isPending,
            trxTypeId: item.spendInfo.amountTypeId
          };

          return response;
        }

        return null;
      })
    )
  }

  public deleteTrx(spendId: number): Observable<ItemModifiedRes[]> {
    const params = new HttpParams()
      .set('spendId', spendId);
    return this.httpClient.delete<ItemModifiedRes[]>(`${environment.baseApi}/api/Spends`, { params: params });
  }

  public addBasicTrx(requestModel: AddTrxRequest, isSpending: boolean): Observable<ItemModifiedRes[]> {
    let url = isSpending ? '/api/Spends/basic' : '/api/Spends/basic/income';
    url = environment.baseApi + url;
    return this.httpClient.post<ItemModifiedRes[]>(url, requestModel);
  }

  public loadAddTrxData(accountPeriodId: number): Observable<AddTrxResponse | undefined> {
    const params = new HttpParams()
      .set('accountPeriodIds', accountPeriodId);
    return this.httpClient.get<AddTrxResponse[]>(`${environment.baseApi}/api/Spends/add`, { params: params }).pipe(
      map(res => {
        return res.find(r => r.accountPeriodId === accountPeriodId)
      })
    );
  }

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
