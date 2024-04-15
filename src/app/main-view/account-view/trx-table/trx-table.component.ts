import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SpendViewModel } from 'src/app/services/models';
import { AccountGroupAccount } from '../../models';

@Component({
  selector: 'app-trx-table',
  templateUrl: './trx-table.component.html',
  styleUrls: ['./trx-table.component.css']
})
export class TrxTableComponent implements OnInit {

  @Output()
  confirmTransaction = new EventEmitter<SpendViewModel>();

  @Output()
  trxDelete = new EventEmitter<SpendViewModel>();

  @Output()
  trxEdit = new EventEmitter<SpendViewModel>();

  @Input()
  acc: AccountGroupAccount;

  constructor() { }

  ngOnInit(): void {
  }

  onConfirmTransaction(_t13: SpendViewModel) {
    this.confirmTransaction.emit(_t13);
  }
  onTrxDelete(_t13: SpendViewModel) {
    this.trxDelete.emit()
  }
  onTrxEdit(_t13: SpendViewModel) {
    this.trxEdit.emit(_t13);
  }

}
