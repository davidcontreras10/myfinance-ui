import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrxAmountComponent } from './trx-amount.component';
import { SpendViewModel } from 'src/app/services/models';

describe('TrxAmountComponent', () => {
  let component: TrxAmountComponent;
  let fixture: ComponentFixture<TrxAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrxAmountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrxAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Direct instantiation - displayedAmount/copyAmount only touch inputs and the
// clipboard API, neither of which needs Angular's DI/rendering.
describe('TrxAmountComponent - copy to clipboard', () => {
  let component: TrxAmountComponent;
  let writeTextSpy: jasmine.Spy;

  function makeSpendViewModel(overrides: Partial<SpendViewModel> = {}): SpendViewModel {
    return {
      accountId: 1,
      spendId: 1,
      spendDate: '2026-08-02',
      setPaymentDate: null,
      spendTypeId: 1,
      spendTypeName: 'Varios',
      currencyName: 'Dollar',
      currencySymbol: '$',
      numerator: 1,
      denominator: 1,
      originalAmount: 11.26,
      description: 'x',
      amountCurrencyId: 1,
      amountTypeId: 1,
      isPending: false,
      convertedAmount: 11.26,
      vmIsSelected: false,
      hasBankTrx: false,
      ...overrides
    } as SpendViewModel;
  }

  beforeEach(() => {
    component = new TrxAmountComponent();
    writeTextSpy = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());
    // navigator.clipboard is a getter-only property in some browsers/headless
    // runners - defineProperty avoids "Cannot set property" failures that a
    // plain assignment would risk.
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: writeTextSpy }, configurable: true });
  });

  it('displayedAmount is the original amount when there is no currency conversion', () => {
    component.spendViewModel = makeSpendViewModel({ numerator: 1, denominator: 1, originalAmount: 11.26, convertedAmount: 999 });

    expect(component.displayedAmount).toBe(11.26);
  });

  it('displayedAmount is the original amount when converted view is toggled on', () => {
    component.spendViewModel = makeSpendViewModel({ numerator: 2, denominator: 1, originalAmount: 130, convertedAmount: 65 });
    component.showConverted = true;

    expect(component.displayedAmount).toBe(130);
  });

  it('displayedAmount is the converted amount when converted view is toggled off (default)', () => {
    component.spendViewModel = makeSpendViewModel({ numerator: 2, denominator: 1, originalAmount: 130, convertedAmount: 65 });
    component.showConverted = false;

    expect(component.displayedAmount).toBe(65);
  });

  it('rounds the displayed amount to cents before copying (floating-point safety)', () => {
    component.spendViewModel = makeSpendViewModel({ numerator: 1, denominator: 1, originalAmount: 10 + 5.53 });

    expect(component.displayedAmount).toBe(15.53);
  });

  it('copies the displayed amount as plain text, no currency symbol', () => {
    component.spendViewModel = makeSpendViewModel({ originalAmount: 11.26 });

    component.copyAmount();

    expect(writeTextSpy).toHaveBeenCalledWith('11.26');
  });

  it('sets justCopied after a successful copy', async () => {
    component.spendViewModel = makeSpendViewModel({ originalAmount: 130 });

    component.copyAmount();
    await Promise.resolve();

    expect(component.justCopied).toBe(true);
  });
});
