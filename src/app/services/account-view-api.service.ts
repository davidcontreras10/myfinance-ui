import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccGroupViewModel, AccountGroupRequest, AccountViewApiModel, AccountViewModel } from './models';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { DragGridPosition } from '../draggable-grid/model';

@Injectable({
  providedIn: 'root'
})
export class AccountViewApiService {

  constructor(private httpClient: HttpClient) { }

  public createNewAccountGroup(model: AccountGroupRequest): Observable<number> {
    const url = `${environment.baseApi}/api/AccountsGroups`;
    return this.httpClient.post<number>(url, model);
  }

  public updateAccountGroup(model: AccountGroupRequest, accountGroupId: number): Observable<number> {
    const url = `${environment.baseApi}/api/AccountsGroups/${accountGroupId}`;
    return this.httpClient.patch<number>(url, model);
  }

  public savePositions(positions: DragGridPosition[]): Observable<any> {
    const model = positions.map(pos => {
      return {
        accountId: pos.id,
        position: pos.position
      }
    })

    const url = `${environment.baseApi}/api/Accounts/positions`;
    return this.httpClient.put(url, model);
  }

  public getAccountGroupById(accountGroupId: number): Observable<AccGroupViewModel> {
    const url = `${environment.baseApi}/api/AccountsGroups/${accountGroupId}`;
    return this.httpClient.get<AccGroupViewModel>(url);
  }

  public getAccountsByAccountGroup(accountGroupId: number | null): Observable<AccountViewModel[]> {
    return this.getMainViewModel(accountGroupId).pipe(
      map(res => {
        return res.accountDetailsViewModels;
      })
    )
  }

  public getMainViewModel(accountGroupId: number | null): Observable<AccountViewApiModel> {
    if (accountGroupId === null) {
      accountGroupId = -1;
    }

    const url = `${environment.baseApi}/api/Accounts/${accountGroupId}`;
    return this.httpClient.get<AccountViewApiModel>(url);
  }
}
