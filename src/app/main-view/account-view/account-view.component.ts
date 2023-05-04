import { Component, Input, OnInit } from '@angular/core';
import { AccountGroupAccount, AccountPeriod } from '../models';
import { MainViewModel } from '../main-view-model';
import { SpendViewModel } from 'src/app/services/models';
import { MainViewApiService } from 'src/app/services/main-view-api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddTrxComponent } from '../add-trx/add-trx.component';

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

  constructor(public mainViewModel: MainViewModel, private mainViewApiService: MainViewApiService, private modalService: NgbModal) {
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

  newExpenseClick() {
    this.openNewTrxModal(true);
  }

  newSpendingClick() {
    this.openNewTrxModal(false);
  }

  private openNewTrxModal(isSpending: boolean) {
    if (this.selectedAccountPeriod?.accountPeriodId) {
      const modalRef = this.modalService.open(AddTrxComponent, { backdrop: 'static', keyboard: false });
      modalRef.componentInstance.isSpending = isSpending;
      modalRef.componentInstance.accountPeriodId = this.selectedAccountPeriod?.accountPeriodId;
      
    }
  }
}
