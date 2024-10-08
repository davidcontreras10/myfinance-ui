import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { AccountGroup, BalanceTypes, BankGroups, MainViewPrefs, TransactionViewModel } from '../main-view/models';
import { environment } from 'src/environments/environment';
import { AccountNotes, AddTransferResponse, AddTrxRequest, AddTrxResponse, BankTrxItemReqResp, BankTrxProcessResponse, BankTrxReqResp, ClientBankItemRequest, FileResponse, FinanceAccountRequest, FinanceAccountResponse, FinancialSummaryAccount, GetFinanceReq, ItemModifiedRes, SelectableItem, TransactionViewResponse, TrxFilters } from './models';
import { Utils } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class MainViewApiService {

  constructor(private httpClient: HttpClient) { }

  public getMainViewPrefs(): Observable<MainViewPrefs> {
    const defPrefs = {
      periodsLimit: 12
    };
    return of(defPrefs);
  }

  getTrxByDate(date: Date): Observable<BankTrxReqResp> {
    const params = new HttpParams()
      .set('date', Utils.toViewDateFormat(date));
    return this.httpClient.get<BankTrxReqResp>(`${environment.baseApi}/api/BankTransactionsFiles`, { params });
  }

  getTrxByDescription(description: string): Observable<BankTrxReqResp> {
    const params = new HttpParams()
      .set('description', description);
    return this.httpClient.get<BankTrxReqResp>(`${environment.baseApi}/api/BankTransactionsFiles`, { params });
  }

  getTrxByRefNumber(refNumber: string): Observable<BankTrxReqResp> {
    const params = new HttpParams()
      .set('refNumber', refNumber);
    return this.httpClient.get<BankTrxReqResp>(`${environment.baseApi}/api/BankTransactionsFiles`, { params });
  }

  deleteBankTrx(transactionId: string, financialEntityId: number): Observable<HttpResponse<any>> {
    return this.httpClient.delete<HttpResponse<any>>(`${environment.baseApi}/api/BankTransactionsFiles/${transactionId}/${financialEntityId}`);
  }

  public getBankTransactionsByAppTrxIds(appTrxIds: number[]): Observable<BankTrxReqResp> {
    let params = new HttpParams();
    for (let trxId of appTrxIds) {
      params = params.append('transactionId', trxId);
    }
    return this.httpClient.get<BankTrxReqResp>(`${environment.baseApi}/api/BankTransactionsFiles/app-transactions`, { params });
  }

  resetBankTrx(transactionId: string, financialEntityId: number): Observable<BankTrxProcessResponse> {
    return this.httpClient.put<BankTrxProcessResponse>(`${environment.baseApi}/api/BankTransactionsFiles/${transactionId}/${financialEntityId}`, {});
  }

  submitBankTrxChanges(requests: ClientBankItemRequest[]): Observable<BankTrxProcessResponse> {
    return this.httpClient.post<BankTrxProcessResponse>(`${environment.baseApi}/api/BankTransactionsFiles/ProcessRequest`, requests);
  }

  getUserTransactionTypes(): Observable<SelectableItem[]> {
    const params = new HttpParams().set('includeAll', false);
    return this.httpClient.get<SelectableItem[]>(`${environment.baseApi}/api/SpendTypes`, { params });
  }

  uploadBankTrxFile(file: File): Observable<HttpEvent<BankTrxReqResp>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const uploadUrl = `${environment.baseApi}/api/BankTransactionsFiles/UploadRequest`
    const req = new HttpRequest('POST', uploadUrl, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      }),
      //reportProgress: true,
      responseType: 'json'
    });

    return this.httpClient.request<BankTrxReqResp>(req);
  }

  uploadScotiabankBankTrxFile(file: File): Observable<HttpEvent<BankTrxReqResp>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const uploadUrl = `${environment.baseApi}/api/BankTransactionsFiles/files/scotiabank`
    const req = new HttpRequest('POST', uploadUrl, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      }),
      //reportProgress: true,
      responseType: 'json'
    });

    return this.httpClient.request<BankTrxReqResp>(req);
  }

  public updateNotes(accountId: number, notes: AccountNotes): Observable<AccountNotes> {
    return this.httpClient.post<AccountNotes>(`${environment.baseApi}/api/accounts/${accountId}/notes`, notes)
  }

  public getAccountPeriodExcel(accountPeriodId: number): Observable<FileResponse | null> {
    return this.httpClient.get(`${environment.baseApi}/api/AccountPeriods/${accountPeriodId}/excel`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(response => {
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = this.getFilenameFromHeaders(response.headers) || this.getFilenameFromContentDisposition(contentDisposition) || 'excel-file.xlsx';
        if (filename === 'excel-file.xlsx') {
          console.warn('File name not read');
        }
        const bytes = response.body;
        if (bytes) {
          const file = new Blob([response.body], { type: 'application/octet-stream' });
          const res = {
            data: file,
            fileName: filename
          };
          return res;
        }
        else {
          return null;
        }
      })
    )
  }

  public getFinanceAccountExcel(requests: GetFinanceReq[], isPending: boolean): Observable<FileResponse | null> {
    requests.forEach(req => {
      const request = {
        accountPeriodId: req.accountPeriodId,
        amountTypeId: 0,
        loanSpends: false,
        pendingSpends: isPending,
        trxFilters: req.trxFilters
      };

      requests.push(request);
    });
    return this.httpClient.post(`${environment.baseApi}/api/Accounts/finance/excel`, requests, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(response => {
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = this.getFilenameFromHeaders(response.headers) || this.getFilenameFromContentDisposition(contentDisposition) || 'excel-file.xlsx';
        if (filename === 'excel-file.xlsx') {
          console.warn('File name not read');
        }
        const bytes = response.body;
        if (bytes) {
          const file = new Blob([response.body], { type: 'application/octet-stream' });
          const res = {
            data: file,
            fileName: filename
          };
          return res;
        } else {
          return null;
        }
      })
    );
  }

  private getFilenameFromHeaders(headers: HttpHeaders): string | null {
    const contentTypeHeader = headers.get('Content-Type');
    if (contentTypeHeader) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentTypeHeader);
      if (matches != null && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }
    return null;
  }

  // Extract filename from Content-Disposition header
  private getFilenameFromContentDisposition(contentDisposition: string | null): string {
    if (!contentDisposition) {
      return '';
    }
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);
    if (matches != null && matches[1]) {
      return matches[1].replace(/['"]/g, '');
    }
    return '';
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

  public confirmPendingMultiple(transactionIds: number[], newDate: Date): Observable<ItemModifiedRes[]> {
    const model = {
      newDateTime: Utils.toViewDateFormat(newDate),
      transactionIds: transactionIds
    };
    return this.httpClient.put<ItemModifiedRes[]>(`${environment.baseApi}/api/spends/bulk-confirmation`, model);
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
            trxTypeId: item.spendInfo.amountTypeId,
            hasBankTrx: item.spendInfo.hasBankTrx,
            transferInfo: item.transferInfo
          };

          return response;
        }

        return null;
      })
    )
  }


  public deleteMultipleTrxs(trxIds: number[]): Observable<ItemModifiedRes[]> {
    let params = new HttpParams();
    for (let trxId of trxIds) {
      params = params.append('spendId', trxId);
    }

    return this.httpClient.delete<ItemModifiedRes[]>(`${environment.baseApi}/api/Spends`, { params: params });
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

  public loadAccountFinanance(requests: GetFinanceReq[], isPending: boolean, expectedDate: Date | undefined = undefined): Observable<FinanceAccountResponse[]> {
    const apiRequests: GetFinanceReq[] = [];
    requests.forEach(req => {
      const request = {
        accountPeriodId: req.accountPeriodId,
        amountTypeId: 0,
        loanSpends: false,
        pendingSpends: isPending,
        trxFilters: req.trxFilters
      };

      apiRequests.push(request);
    });

    const body: any = null;
    let params = new HttpParams();
    if (expectedDate) {
      params = new HttpParams().set("expectedDate", Utils.toViewDateFormat(expectedDate))
    }
    return this.httpClient.post<FinanceAccountResponse[]>(`${environment.baseApi}/api/Accounts/finance`, apiRequests, { params: params });
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
