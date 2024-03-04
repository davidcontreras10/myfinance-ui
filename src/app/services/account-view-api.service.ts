import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AccGroupViewModel,
  AccountGroupRequest,
  AccountViewApiModel,
  AccountViewModel,
  AddNewAccountViewModel,
  BasicAccountIncluded,
  EditAccountViewModel,
  NewAccountViewModel,
} from './models';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { DragGridPosition } from '../draggable-grid/model';

@Injectable({
  providedIn: 'root',
})
export class AccountViewApiService {
  constructor(private httpClient: HttpClient) {}

  public getEditAccountViewModel(
    accountId: number
  ): Observable<EditAccountViewModel> {
    const params = new HttpParams().set('accountIds', accountId);
    const url = `${environment.baseApi}/api/Accounts`;
    return this.httpClient
      .get<EditAccountViewModel[]>(url, {
        params,
      })
      .pipe(
        map((res) => {
          const accountInfo = res[0];
          return accountInfo;
        })
      );
  }

  public addNewAccount(model: NewAccountViewModel): Observable<void> {
    return this.httpClient.post<void>(
      `${environment.baseApi}/api/Accounts`,
      model
    );
  }

  public getPossibleAccountInclude(
    currencyId: number,
    financialEntityId: number | undefined
  ): Observable<BasicAccountIncluded[]> {
    const url = `${environment.baseApi}/api/Accounts/include/${currencyId}`;
    if (financialEntityId && financialEntityId > 0) {
      financialEntityId = financialEntityId;
    } else {
      financialEntityId = 0;
    }

    const params = new HttpParams().set('financialEntityId', financialEntityId);
    return this.httpClient.get<BasicAccountIncluded[]>(url, {
      params,
    });
  }

  public getAddAccountViewModel(): Observable<AddNewAccountViewModel> {
    const url = `${environment.baseApi}/api/Accounts/add`;
    return this.httpClient.get<AddNewAccountViewModel>(url).pipe(
      map((v) => {
        v.accountIncludeViewModels = [];
        return v;
      })
    );
  }

  public createNewAccountGroup(model: AccountGroupRequest): Observable<number> {
    const url = `${environment.baseApi}/api/AccountsGroups`;
    return this.httpClient.post<number>(url, model);
  }

  public updateAccountGroup(
    model: AccountGroupRequest,
    accountGroupId: number
  ): Observable<number> {
    const url = `${environment.baseApi}/api/AccountsGroups/${accountGroupId}`;
    return this.httpClient.patch<number>(url, model);
  }

  public savePositions(positions: DragGridPosition[]): Observable<any> {
    const model = positions.map((pos) => {
      return {
        accountId: pos.id,
        position: pos.position,
      };
    });

    const url = `${environment.baseApi}/api/Accounts/positions`;
    return this.httpClient.put(url, model);
  }

  public getAccountGroupById(
    accountGroupId: number
  ): Observable<AccGroupViewModel> {
    const url = `${environment.baseApi}/api/AccountsGroups/${accountGroupId}`;
    return this.httpClient.get<AccGroupViewModel>(url);
  }

  public getAccountsByAccountGroup(
    accountGroupId: number | null
  ): Observable<AccountViewModel[]> {
    return this.getMainViewModel(accountGroupId).pipe(
      map((res) => {
        return res.accountDetailsViewModels;
      })
    );
  }

  public getMainViewModel(
    accountGroupId: number | null
  ): Observable<AccountViewApiModel> {
    if (accountGroupId === null) {
      accountGroupId = -1;
    }

    const url = `${environment.baseApi}/api/Accounts/${accountGroupId}`;
    return this.httpClient.get<AccountViewApiModel>(url);
  }
}
