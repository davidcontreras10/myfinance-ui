import { Component, Input, OnInit } from '@angular/core';
import { AccountGroupAccount, AccountPeriod } from '../models';
import { MainViewModel } from '../main-view-model';

@Component({
  selector: 'app-account-view',
  templateUrl: './account-view.component.html',
  styleUrls: ['./account-view.component.css']
})
export class AccountViewComponent implements OnInit {
  @Input()
  acc: AccountGroupAccount;
  selectedAccountPeriod?: AccountPeriod;
  showTraxList = false;

  constructor(public mainViewModel: MainViewModel) {
  }

  ngOnInit(): void {
    this.selectedAccountPeriod = this.acc.accountPeriods.find(accp => accp.accountPeriodId === this.acc.currentPeriodId);
    this.mainViewModel.listenOnPeriodChange(this.acc.accountId).subscribe((accountPeriod) => {
      this.selectedAccountPeriod = accountPeriod;
    })
  }

  onPeriodChanged(id: number) {
    this.mainViewModel.notifyPeriodChange(id);
  }

  orderedPeriods() {
    return this.acc.accountPeriods.sort((accA, accB) => new Date(accB.initialDate).getTime() - new Date(accA.initialDate).getTime())
  }

  toggleTrxList(){
    this.showTraxList = !this.showTraxList;
  }
}
