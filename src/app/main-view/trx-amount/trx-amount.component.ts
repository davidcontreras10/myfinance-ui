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

  showConverted = false;

  constructor() { }

  ngOnInit(): void {
  }

  get isOriginal(): boolean {
    return this.spendViewModel.numerator == 1 && this.spendViewModel.denominator == 1;
  }

  toggleConverted() {
    this.showConverted = !this.showConverted;
  }

}
