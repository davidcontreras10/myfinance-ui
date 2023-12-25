import { Component, Input, OnInit } from '@angular/core';
import { AccountGroupAccount, AccountPeriod } from '../models';
import { MainViewModel } from '../main-view-model';
import { SpendViewModel } from 'src/app/services/models';
import { MainViewApiService } from 'src/app/services/main-view-api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddTrxComponent } from '../add-trx/add-trx.component';
import { ViewTrxComponent } from '../view-trx/view-trx.component';
import { TransferViewComponent } from '../transfer-view/transfer-view.component';
import { saveAs } from "file-saver";
import { AccountNotesComponent } from '../account-notes/account-notes.component';

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
    const accountPeriodId = this.mainViewModel.periodIds[this.acc.accountId] ?? this.acc.currentPeriodId;
    this.selectedAccountPeriod = this.acc.accountPeriods.find(accp => accp.accountPeriodId === accountPeriodId);
    this.mainViewModel.listenOnPeriodChange(this.acc.accountId).subscribe((accountPeriod) => {
      this.selectedAccountPeriod = accountPeriod;
      this.mainViewApiService.loadAccountFinanance([accountPeriod.accountPeriodId], this.mainViewModel.showPendings).subscribe(responses => {
        this.mainViewModel.updateFinanceInfo(responses);
      });
    })
  }

  confirmTransaction(trx: SpendViewModel) {
    if (trx.isPending && confirm('Confirm pending transaction?')) {
      this.mainViewApiService.confirmPending(trx.spendId, new Date()).subscribe(items => {
        this.mainViewModel.notifyAccountsModified(items);
      })
    }
  }

  onPeriodChanged(id: number) {
    this.mainViewModel.notifyPeriodChange(id);
  }

  orderedPeriods() {
    return this.acc.accountPeriods.sort((accA, accB) => new Date(accB.initialDate).getTime() - new Date(accA.initialDate).getTime())
      .slice(0, this.mainViewModel.mainViewPrefs.periodsLimit);
  }

  toggleTrxList() {
    this.showTraxList = !this.showTraxList;
  }

  onTrxEdit(trx: SpendViewModel) {
    if (trx && this.selectedAccountPeriod) {
      const modalRef = this.modalService.open(ViewTrxComponent, { backdrop: 'static', keyboard: false });
      modalRef.componentInstance.accountPeriodId = this.selectedAccountPeriod.accountPeriodId;
      modalRef.componentInstance.spendId = trx.spendId;
    }
  }

  onTrxDelete(trx: SpendViewModel) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.mainViewApiService.deleteTrx(trx.spendId).subscribe(items => {
        this.mainViewModel.notifyAccountsModified(items);
      })
    }
  }

  newExpenseClick() {
    this.openNewTrxModal(true);
  }

  newSpendingClick() {
    this.openNewTrxModal(false);
  }

  downloadExcelFile() {
    if (this.selectedAccountPeriod?.accountPeriodId && confirm('Download excel file?')) {
      this.mainViewApiService.getAccountPeriodExcel(this.selectedAccountPeriod.accountPeriodId).subscribe(data => {
        if (data?.data) {
          saveAs(data.data, data.fileName);
        }
      })
    }
  }

  newTransferClick() {
    if (this.selectedAccountPeriod) {
      const modalRef = this.modalService.open(TransferViewComponent, { backdrop: 'static', keyboard: false, size: 'lg' });
      modalRef.componentInstance.accountPeriodId = this.selectedAccountPeriod?.accountPeriodId;
    }
  }

  public openNotesModal(account: AccountGroupAccount) {
    if (account) {
      const modalRef = this.modalService.open(AccountNotesComponent, { backdrop: true, keyboard: false, size: 'md' });
      modalRef.componentInstance.account = account;
    }
  }

  private openNewTrxModal(isSpending: boolean) {
    if (this.selectedAccountPeriod?.accountPeriodId) {
      const modalRef = this.modalService.open(AddTrxComponent, { backdrop: 'static', keyboard: false });
      modalRef.componentInstance.isSpending = isSpending;
      modalRef.componentInstance.accountPeriodId = this.selectedAccountPeriod?.accountPeriodId;

    }
  }

  createFileFromByteArray(blob: Blob, fileName: string) {
    saveAs(blob, fileName);
  }
}
