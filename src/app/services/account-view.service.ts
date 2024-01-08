import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountViewApiModel, AccountViewModel } from './models';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { DragGridPosition } from '../draggable-grid/model';

@Injectable({
  providedIn: 'root'
})
export class AccountViewService {

  constructor(private httpClient: HttpClient) { }

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
