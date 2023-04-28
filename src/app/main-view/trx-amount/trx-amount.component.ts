import { Component, Input, OnInit } from '@angular/core';
import { AccountGroupAccount } from '../models';
import { SpendViewModel } from 'src/app/services/models';

@Component({
  selector: 'app-trx-amount',
  templateUrl: './trx-amount.component.html',
  styleUrls: ['./trx-amount.component.css']
})
export class TrxAmountComponent implements OnInit {

  @Input()
  account: AccountGroupAccount;

  @Input()
  spendViewModel: SpendViewModel;

  constructor() { }

  ngOnInit(): void {
  }

}
