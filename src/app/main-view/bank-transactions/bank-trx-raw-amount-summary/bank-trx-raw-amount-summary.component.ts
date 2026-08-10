import { Component, Input } from '@angular/core';
import { BankTrxRawAmountSummaryBank, BankTrxRawAmountSummaryResponse } from 'src/app/services/models';

@Component({
  selector: 'app-bank-trx-raw-amount-summary',
  templateUrl: './bank-trx-raw-amount-summary.component.html',
  styleUrls: ['./bank-trx-raw-amount-summary.component.css']
})
export class BankTrxRawAmountSummaryComponent {

  @Input() summary: BankTrxRawAmountSummaryResponse | null = null;
  @Input() rawAmountSummaryLoading = false;

  getAmount(bank: BankTrxRawAmountSummaryBank, currencyId: number): number | null {
    const found = bank.currencyAmounts.find(c => c.currencyId === currencyId);
    return found ? found.amount : null;
  }
}
