import { Component, Input, OnInit } from '@angular/core';
import { AccountGroupAccount, AccountPeriod } from '../models';
import { MainViewModel } from '../main-view-model';
import { SpendViewModel } from 'src/app/services/models';
import { MainViewApiService } from 'src/app/services/main-view-api.service';

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

  constructor(public mainViewModel: MainViewModel, private mainViewApiService: MainViewApiService) {
  }

  ngOnInit(): void {
    this.selectedAccountPeriod = this.acc.accountPeriods.find(accp => accp.accountPeriodId === this.acc.currentPeriodId);
    this.mainViewModel.listenOnPeriodChange(this.acc.accountId).subscribe((accountPeriod) => {
      this.selectedAccountPeriod = accountPeriod;
      this.mainViewApiService.loadAccountFinanance([accountPeriod.accountPeriodId], this.mainViewModel.showPendings).subscribe(responses => {
        this.mainViewModel.updateFinanceInfo(responses);
      });
    })
  }

  onPeriodChanged(id: number) {
    this.mainViewModel.notifyPeriodChange(id);
  }

  orderedPeriods() {
    return this.acc.accountPeriods.sort((accA, accB) => new Date(accB.initialDate).getTime() - new Date(accA.initialDate).getTime())
  }

  toggleTrxList() {
    this.showTraxList = !this.showTraxList;
  }

  onTrxEdit(trx: SpendViewModel) {
    console.log('onTrxEdit');
  }

  onTrxDelete(trx: SpendViewModel) {
    console.log('onTrxDelete');
  }
}
