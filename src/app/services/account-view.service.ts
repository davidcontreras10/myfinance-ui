import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountViewApiModel } from './models';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountViewService {

  constructor(private httpClient: HttpClient) { }

  public getMainViewModel(accountGroupId: number | null): Observable<AccountViewApiModel> {
    if (accountGroupId === null) {
      accountGroupId = -1;
    }

    const url = `${environment.baseApi}/api/Accounts/${accountGroupId}`;
    return this.httpClient.get<AccountViewApiModel>(url);
  }
}
