import { Component, Input, OnInit } from '@angular/core';
import { AccountGroupAccount } from '../models';
import { SpendViewModel } from 'src/app/services/models';
import { Utils } from '../../utils';

const COPIED_FEEDBACK_MS = 1500;

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
  justCopied = false;

  constructor() { }

  ngOnInit(): void {
  }

  get isOriginal(): boolean {
    return this.spendViewModel.numerator == 1 && this.spendViewModel.denominator == 1;
  }

  toggleConverted() {
    this.showConverted = !this.showConverted;
  }

  // Whichever amount is currently on screen - mirrors the same original/converted
  // branching as the template, so "copy" always copies what the user is looking at.
  get displayedAmount(): number {
    const amount = this.isOriginal || this.showConverted
      ? this.spendViewModel.originalAmount
      : this.spendViewModel.convertedAmount;
    return Utils.roundToCents(amount);
  }

  copyAmount(): void {
    navigator.clipboard.writeText(String(this.displayedAmount)).then(() => {
      this.justCopied = true;
      setTimeout(() => this.justCopied = false, COPIED_FEEDBACK_MS);
    });
  }

}
