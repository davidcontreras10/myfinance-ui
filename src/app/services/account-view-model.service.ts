import { Injectable } from '@angular/core';
import { AccGroupViewModel } from './models';

@Injectable({
  providedIn: 'root'
})
export class AccountViewModelService {

  constructor() { }

  /** The user's groups in position order. Loaded by the Accounts page; the groups modal refreshes it. */
  accountGroups: AccGroupViewModel[];
}
