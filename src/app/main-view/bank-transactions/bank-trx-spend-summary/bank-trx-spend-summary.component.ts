import { Component, Input } from '@angular/core';
import { BankTrxSpendSummaryAccount, BankTrxSpendSummaryResponse } from 'src/app/services/models';

@Component({
  selector: 'app-bank-trx-spend-summary',
  templateUrl: './bank-trx-spend-summary.component.html',
  styleUrls: ['./bank-trx-spend-summary.component.css']
})
export class BankTrxSpendSummaryComponent {

  @Input() summary: BankTrxSpendSummaryResponse | null = null;
  @Input() spendSummaryloading = false;

  getAmount(account: BankTrxSpendSummaryAccount, currencyId: number): number | null {
    const found = account.currencyAmounts.find(c => c.currencyId === currencyId);
    return found ? found.amount : null;
  }

  isDefaultCurrency(account: BankTrxSpendSummaryAccount, currencyId: number): boolean {
    return account.currencyId === currencyId;
  }

  getCurrencySymbol(currencyId: number): string {
    return this.summary?.currencies.find(c => c.id === currencyId)?.symbol ?? '';
  }
}
