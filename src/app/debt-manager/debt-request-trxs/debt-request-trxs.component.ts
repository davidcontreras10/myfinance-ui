import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DebtManagerApiService } from 'src/app/services/debt-manager-api.service';
import { DebtRequestAppTrx, DebtRequestVm, SelectableItem } from 'src/app/services/models';
import { ToasterService } from 'src/app/services/toaster.service';
import { TrxTypeServiceService } from 'src/app/services/trx-type-service.service';

@Component({
  selector: 'app-debt-request-trxs',
  templateUrl: './debt-request-trxs.component.html',
  styleUrls: ['./debt-request-trxs.component.css']
})
export class DebtRequestTrxsComponent implements OnInit {

  @Input()
  debtRequestVm: DebtRequestVm;
  accounts: SelectableItem[] = [];
  trxTypes: SelectableItem[] = [];
  transactions: DebtRequestAppTrx[] = [];
  hasTrxCreated = false;

  constructor(public activeModal: NgbActiveModal,
    private debtManagerApiService: DebtManagerApiService,
    private trxTypeService: TrxTypeServiceService,
    private toasterService: ToasterService
  ) { }

  submit(_t5: NgForm) {
    if (this.hasTrxCreated || !this.areTrxsAmountsValid) {
      return;
    }

    const model = this.transactions.filter(t => t.accountId && t.accountId > 0 && t.amount > 0);
    if (model.length === 0) {
      return;
    }
    this.debtManagerApiService.addTransactionsToDebtRequest(this.debtRequestVm.id, model).subscribe((data) => {
      const accountsModifiedCount = data.length;
      this.toasterService.success(`${accountsModifiedCount} account/s updated`);
      this.activeModal.close('saved');
    });
  }

  ngOnInit(): void {
    this.debtManagerApiService.getAccountsForAddingTrx(this.debtRequestVm.currency.id).subscribe(data => {
      this.accounts = data;
    });

    this.trxTypeService.getUserTransactionTypes(false).subscribe(data => {
      this.trxTypes = data;
    });
    this.loadTransactions();
  }

  resetTransactions() {
    if (!confirm('Are you sure you want to reset the transactions? This will remove all transactions from the accounts.')) {
      return;
    }

    this.debtManagerApiService.deleteAllDebtRequestAppTrxs(this.debtRequestVm.id).subscribe(() => {
      this.loadTransactions();
      this.toasterService.success('Transactions have been removed successfully.');
    });
  }

  addEmptyTransaction() {
    this.transactions.push(this.createEmptyTransaction());
  }
  removeTransaction(index: number) {
    this.transactions.splice(index, 1);
  }

  get areTrxsAmountsValid() {
    const totalTrxsAmount = this.transactions.map(t => t.amount).reduce((a, b) => a + b, 0);
    return totalTrxsAmount === this.debtRequestVm.amount;
  }

  get modalTitle() {
    return this.debtRequestVm.eventName?.trim().substring(0, 50) || 'Event transactions';
  }

  get totalTrxsAmount() {
    return this.transactions.map(t => t.amount).reduce((a, b) => a + b, 0);
  }

  private loadTransactions() {
    this.transactions = [];
    this.hasTrxCreated = false;
    this.debtManagerApiService.getDebtRequestAppTrxs(this.debtRequestVm.id).subscribe(data => {
      this.transactions = data;
      if (this.transactions.length === 0) {
        this.transactions.push(this.createEmptyTransaction());
      }
      else {
        this.hasTrxCreated = true;
      }
    });
  }

  private createEmptyTransaction() {
    const description = this.debtRequestVm?.eventDescription?.trim() || this.debtRequestVm?.eventName?.trim() || '';
    const emptyTrx = { amount: this.getNextEmptyTransactionAmount(), accountId: null, description: description, trxTypeId: 1 };
    return emptyTrx;
  }

  private getNextEmptyTransactionAmount() {
    const totalTrxsAmount = this.transactions.map(t => t.amount).reduce((a, b) => a + b, 0);
    return Math.max(0, this.debtRequestVm.amount - totalTrxsAmount);
  }

}
