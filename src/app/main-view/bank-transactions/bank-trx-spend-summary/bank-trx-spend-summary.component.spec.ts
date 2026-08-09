import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankTrxSpendSummaryComponent } from './bank-trx-spend-summary.component';
import { CurrencyAmountPipe } from 'src/app/currency-amount.pipe';
import { BankTrxSpendSummaryAccount, BankTrxSpendSummaryResponse } from 'src/app/services/models';

describe('BankTrxSpendSummaryComponent', () => {
  let component: BankTrxSpendSummaryComponent;
  let fixture: ComponentFixture<BankTrxSpendSummaryComponent>;

  const dollarCurrency = { currencyId: 1, symbol: '$', name: 'Dollar' };
  const colonesCurrency = { currencyId: 2, symbol: '₡', name: 'Colones' };
  const euroCurrency = { currencyId: 3, symbol: '€', name: 'Euro' };

  const cuentaBacAccount: BankTrxSpendSummaryAccount = {
    accountId: 1,
    accountName: 'CUENTA BAC',
    currencyId: dollarCurrency.currencyId,
    currencyAmounts: [
      { currencyId: dollarCurrency.currencyId, amount: 150 },
      { currencyId: colonesCurrency.currencyId, amount: 25000 },
      { currencyId: euroCurrency.currencyId, amount: 100 }
    ],
    total: 300
  };

  const bacColonesAccount: BankTrxSpendSummaryAccount = {
    accountId: 2,
    accountName: 'BAC COLONES',
    currencyId: colonesCurrency.currencyId,
    currencyAmounts: [
      { currencyId: dollarCurrency.currencyId, amount: 10 },
      { currencyId: colonesCurrency.currencyId, amount: 30000 }
    ],
    total: 35000
  };

  const summary: BankTrxSpendSummaryResponse = {
    currencies: [dollarCurrency, colonesCurrency, euroCurrency],
    banks: [
      {
        financialEntityId: 1,
        financialEntityName: 'Bac San Jose',
        accounts: [cuentaBacAccount, bacColonesAccount]
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankTrxSpendSummaryComponent, CurrencyAmountPipe]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BankTrxSpendSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not render a table when there is no summary', () => {
    component.summary = null;
    fixture.detectChanges();
    const table = fixture.nativeElement.querySelector('table');
    expect(table).toBeNull();
  });

  it('should render one row per account across all banks', () => {
    component.summary = summary;
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should render a header column per currency plus Bank, Account and Total', () => {
    component.summary = summary;
    fixture.detectChanges();
    const headerElements: Element[] = Array.from(fixture.nativeElement.querySelectorAll('thead th'));
    const headers: string[] = headerElements.map(el => el.textContent?.trim() ?? '');
    expect(headers).toEqual(['Bank', 'Account', 'Dollar', 'Colones', 'Euro', 'Total']);
  });

  describe('getAmount', () => {
    it('returns the amount when the account has an entry for that currency', () => {
      expect(component.getAmount(cuentaBacAccount, colonesCurrency.currencyId)).toBe(25000);
    });

    it('returns null when the account has no entry for that currency', () => {
      expect(component.getAmount(bacColonesAccount, euroCurrency.currencyId)).toBeNull();
    });
  });

  describe('isDefaultCurrency', () => {
    it('returns true when the currency matches the account default currency', () => {
      expect(component.isDefaultCurrency(cuentaBacAccount, dollarCurrency.currencyId)).toBe(true);
    });

    it('returns false when the currency does not match the account default currency', () => {
      expect(component.isDefaultCurrency(cuentaBacAccount, colonesCurrency.currencyId)).toBe(false);
    });
  });

  describe('getCurrencySymbol', () => {
    it('returns the symbol for a known currency id', () => {
      component.summary = summary;
      expect(component.getCurrencySymbol(colonesCurrency.currencyId)).toBe('₡');
    });

    it('returns an empty string when there is no summary loaded', () => {
      component.summary = null;
      expect(component.getCurrencySymbol(colonesCurrency.currencyId)).toBe('');
    });

    it('returns an empty string for an unknown currency id', () => {
      component.summary = summary;
      expect(component.getCurrencySymbol(999)).toBe('');
    });
  });

  it('should show a loading message when loading with no prior summary', () => {
    component.summary = null;
    component.spendSummaryloading = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading spend summary');
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('should keep showing the existing table (with a loading indicator) while refreshing', () => {
    component.summary = summary;
    component.spendSummaryloading = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).not.toBeNull();
    const loadingDiv = fixture.nativeElement.querySelector('.on-data-loading');
    expect(loadingDiv).not.toBeNull();
  });

  it('should render "-" for a currency the account has no amount in, and highlight the default currency cell', () => {
    component.summary = summary;
    fixture.detectChanges();
    const secondRow: Element = fixture.nativeElement.querySelectorAll('tbody tr')[1];
    const secondRowCells: Element[] = Array.from(secondRow.querySelectorAll('td'));
    // second row has no Bank cell (merged into the first row via rowspan): Account, Dollar, Colones, Euro, Total
    const euroCell = secondRowCells[3];
    expect(euroCell.textContent?.trim()).toBe('-');

    const colonesCell = secondRowCells[2];
    expect(colonesCell.classList.contains('default-currency-amount')).toBe(true);
  });

  it('should merge the bank name into a single cell spanning all of its accounts', () => {
    component.summary = summary;
    fixture.detectChanges();
    const rows: Element[] = Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));

    const firstRowBankCell = rows[0].querySelector('td.bank-name-cell');
    expect(firstRowBankCell?.textContent?.trim()).toBe('Bac San Jose');
    expect(firstRowBankCell?.getAttribute('rowspan')).toBe('2');

    const secondRowBankCell = rows[1].querySelector('td.bank-name-cell');
    expect(secondRowBankCell).toBeNull();
  });
});
