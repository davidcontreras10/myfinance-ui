import { Component, Input, OnInit } from '@angular/core';
import { BankTrxReqRespPair } from '../../models';
import { BankTransactionStatus, BankTrxSpendViewModel, SelectableItem } from 'src/app/services/models';

@Component({
  selector: 'app-bank-trx-multiple',
  templateUrl: './bank-trx-multiple.component.html',
  styleUrls: ['./bank-trx-multiple.component.css']
})
export class BankTrxMultipleComponent implements OnInit {
  removeTransaction(_t9: BankTrxSpendViewModel, arg1: BankTrxReqRespPair) {
    throw new Error('Method not implemented.');
  }
  BankTransactionStatus = BankTransactionStatus;

  @Input() transactionTypes: SelectableItem[] = [];
  @Input() selectedTransaction: BankTrxReqRespPair | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  onAccountChange($event: Event, _t9: BankTrxSpendViewModel) {
    //throw new Error('Method not implemented.');
  }
}
