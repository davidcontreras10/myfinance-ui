import { Component, Input, OnInit } from '@angular/core';
import { BankTrxReqRespPair } from '../../models';
import { BankTransactionStatus, BankTrxSpendViewModel, SelectableItem } from 'src/app/services/models';

@Component({
  selector: 'app-bank-trx-multiple',
  templateUrl: './bank-trx-multiple.component.html',
  styleUrls: ['./bank-trx-multiple.component.css']
})
export class BankTrxMultipleComponent implements OnInit {
  BankTransactionStatus = BankTransactionStatus;

  @Input() transactionTypes: SelectableItem[] = [];
  @Input() selectedTransaction: BankTrxReqRespPair | null = null;

  constructor() { }

  removeTransaction(_t9: BankTrxSpendViewModel, arg1: BankTrxReqRespPair) {
    if (this.selectedTransaction) {
      this.selectedTransaction.removeTrx(_t9);
    }
  }

  addAppTrx() {
    if (this.selectedTransaction) {
      this.selectedTransaction.addTrx();
    }
  }

  ngOnInit(): void {
  }

  onAccountChange($event: Event, bankTrx: BankTrxSpendViewModel) {
    if (!this.selectedTransaction) {
      return;
    }

    const target = $event.target as HTMLSelectElement;
    const accountId = Number(target.value);
    const account = this.selectedTransaction.accounts.find(a => a.id === accountId);
    if (account && account.trxTypeId) {
      bankTrx.spendTypeId = account.trxTypeId;
    }
  }
}
