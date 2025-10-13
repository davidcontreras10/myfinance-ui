import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DebtManagerApiService } from 'src/app/services/debt-manager-api.service';
import { DebtRequestVm, SelectableItem } from 'src/app/services/models';
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
  transactions: { amount: number, accountId: number | null, description: string, trxTypeId: number }[] = [];

  constructor(public activeModal: NgbActiveModal,
    private debtManagerApiService: DebtManagerApiService,
    private trxTypeService: TrxTypeServiceService
  ) { }

  submit(_t5: NgForm) {
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

  addTransaction() {
    this.transactions.push(this.createEmptyTransaction());
  }
  removeTransaction(index: number) {
    this.transactions.splice(index, 1);
  }

  get modalTitle() {
    return this.debtRequestVm.eventName?.trim().substring(0, 50) || 'Event transactions';
  }

  private loadTransactions() {
    if (this.transactions.length === 0) {
      this.transactions.push(this.createEmptyTransaction());
    }
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
