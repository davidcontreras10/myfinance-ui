import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankTrxRawAmountSummaryComponent } from './bank-trx-raw-amount-summary.component';
import { CurrencyAmountPipe } from 'src/app/currency-amount.pipe';
import { BankTrxRawAmountSummaryBank, BankTrxRawAmountSummaryResponse } from 'src/app/services/models';

describe('BankTrxRawAmountSummaryComponent', () => {
  let component: BankTrxRawAmountSummaryComponent;
  let fixture: ComponentFixture<BankTrxRawAmountSummaryComponent>;

  const dollarCurrency = { currencyId: 1, currencyName: 'Dollar', symbol: '$', isoCode: 'USD', isDefault: false };
  const colonesCurrency = { currencyId: 2, currencyName: 'Colones', symbol: '₡', isoCode: 'CRC', isDefault: false };
  const euroCurrency = { currencyId: 3, currencyName: 'Euro', symbol: '€', isoCode: 'EUR', isDefault: false };

  const bacSanJoseBank: BankTrxRawAmountSummaryBank = {
    financialEntityId: 1,
    financialEntityName: 'Bac San Jose',
    currencyAmounts: [
      { currencyId: dollarCurrency.currencyId, amount: 150 },
      { currencyId: colonesCurrency.currencyId, amount: 25000 }
    ]
  };

  const scotiabankBank: BankTrxRawAmountSummaryBank = {
    financialEntityId: 2,
    financialEntityName: 'Scotiabank',
    currencyAmounts: [
      { currencyId: colonesCurrency.currencyId, amount: 5000 }
    ]
  };

  const summary: BankTrxRawAmountSummaryResponse = {
    currencies: [dollarCurrency, colonesCurrency, euroCurrency],
    banks: [bacSanJoseBank, scotiabankBank]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankTrxRawAmountSummaryComponent, CurrencyAmountPipe]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BankTrxRawAmountSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not render a table when there is no summary', () => {
    component.summary = null;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('should render one row per bank, with no Account or Total column', () => {
    component.summary = summary;
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    const headerElements: Element[] = Array.from(fixture.nativeElement.querySelectorAll('thead th'));
    const headers: string[] = headerElements.map(el => el.textContent?.trim() ?? '');
    expect(headers).toEqual(['Bank', 'Dollar', 'Colones', 'Euro']);
  });

  describe('getAmount', () => {
    it('returns the amount when the bank has an entry for that currency', () => {
      expect(component.getAmount(bacSanJoseBank, colonesCurrency.currencyId)).toBe(25000);
    });

    it('returns null when the bank has no entry for that currency', () => {
      expect(component.getAmount(scotiabankBank, dollarCurrency.currencyId)).toBeNull();
    });
  });

  it('should render "-" for a currency a bank has no amount in', () => {
    component.summary = summary;
    fixture.detectChanges();
    const secondRow: Element = fixture.nativeElement.querySelectorAll('tbody tr')[1];
    const secondRowCells: Element[] = Array.from(secondRow.querySelectorAll('td'));
    // cells: Bank, Dollar, Colones, Euro
    expect(secondRowCells[1].textContent?.trim()).toBe('-');
    expect(secondRowCells[2].textContent?.trim()).not.toBe('-');
    expect(secondRowCells[3].textContent?.trim()).toBe('-');
  });

  it('should show a loading message when loading with no prior summary', () => {
    component.summary = null;
    component.rawAmountSummaryLoading = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading raw amounts');
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('should keep showing the existing table (with a loading indicator) while refreshing', () => {
    component.summary = summary;
    component.rawAmountSummaryLoading = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.on-data-loading')).not.toBeNull();
  });
});
