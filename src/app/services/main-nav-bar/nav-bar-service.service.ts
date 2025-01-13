import { Injectable } from '@angular/core';
import { Observable, Subject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavBarServiceService {

  private subMenuClick = new Subject<string>();

  constructor() { }

  public emitSubMenuEvent(data: string) {
    this.subMenuClick.next(data);
  }

  getSubMenuEvents(...events: string[]): Observable<string> {
    return this.subMenuClick.pipe(
      filter(value => events.includes(value))
    );
  }
}

export enum NavBarMenusIds {
  ACCOUNT_GROUPS = 'account-groups',
  NEW_ACCOUNT = 'new-account',
  NEW_TRX_TYPE = 'new-trx-type',
  SET_PERIODS_DATE = 'set-periods-date',
  MAIN_VIEW_PREFS = 'main-view-prefs',
  UPLOAD_SCOT_TRX_FILE = 'upload-trx-file',
  BANK_TRX_FILE = 'bank-trx-file',
  DEBT_MANAGER = 'debt-manager'
}