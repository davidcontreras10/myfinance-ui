import { Injectable } from '@angular/core';
import { AccGroupViewModel } from './models';

@Injectable({
  providedIn: 'root'
})
export class AccountViewModelService {

  constructor() { }

  accountGroups: AccGroupViewModel[];

  public upsertAccountGroup(model: AccGroupViewModel) {
    if (this.accountGroups) {
      let removeIndex = -1;
      for (let i = 0; i < this.accountGroups.length; i++) {
        if (this.accountGroups[i].accountGroupId === model.accountGroupId) {
          removeIndex = i;
          break;
        }
      }

      if (removeIndex >= 0) {
        this.accountGroups.splice(removeIndex, 1, model);
        return;
      }
    }
    else {
      this.accountGroups = [];
    }

    this.accountGroups.push(model);
  }
}
