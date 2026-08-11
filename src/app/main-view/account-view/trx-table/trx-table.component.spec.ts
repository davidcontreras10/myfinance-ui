import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TrxTableComponent } from './trx-table.component';
import { MainViewModel } from '../../main-view-model';
import { AccountGroupAccount } from '../../models';
import { SpendViewModel } from 'src/app/services/models';

describe('TrxTableComponent', () => {
  let component: TrxTableComponent;
  let fixture: ComponentFixture<TrxTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrxTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrxTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Direct instantiation (no TestBed) - selection logic only touches `acc`, which
// doesn't need Angular's DI/rendering. Mirrors the pattern already established
// for BankTransactionsComponent's spec.
describe('TrxTableComponent - card selection', () => {
  let component: TrxTableComponent;
  let mainViewModelSpy: { listenAccountsModelChanges: jasmine.Spy };

  function makeTrx(overrides: Partial<SpendViewModel> = {}): SpendViewModel {
    return {
      accountId: 1,
      spendId: Math.floor(Math.random() * 100000),
      spendDate: '2026-08-02',
      setPaymentDate: null,
      spendTypeId: 1,
      spendTypeName: 'Varios',
      currencyName: 'Dollar',
      currencySymbol: '$',
      numerator: 1,
      denominator: 1,
      originalAmount: 100,
      description: 'x',
      amountCurrencyId: 1,
      amountTypeId: 1,
      isPending: false,
      convertedAmount: 100,
      vmIsSelected: false,
      hasBankTrx: false,
      ...overrides
    } as SpendViewModel;
  }

  function makeAcc(spendViewModels: SpendViewModel[]): AccountGroupAccount {
    return {
      accountId: 1,
      financeData: { spendViewModels } as any
    } as AccountGroupAccount;
  }

  beforeEach(() => {
    mainViewModelSpy = {
      listenAccountsModelChanges: jasmine.createSpy('listenAccountsModelChanges').and.returnValue(of([]))
    };
    component = new TrxTableComponent(mainViewModelSpy as unknown as MainViewModel);
  });

  it('anySelected is false with nothing checked', () => {
    component.acc = makeAcc([makeTrx(), makeTrx()]);

    expect(component.anySelected()).toBe(false);
  });

  it('anySelected is true once one row is checked, and reports the right count', () => {
    component.acc = makeAcc([makeTrx({ vmIsSelected: true }), makeTrx()]);

    expect(component.anySelected()).toBe(true);
    expect(component.selectedItemsCount()).toBe(1);
  });

  it('anyPending only counts selected rows that are also pending', () => {
    component.acc = makeAcc([
      makeTrx({ vmIsSelected: true, isPending: false }),
      makeTrx({ vmIsSelected: false, isPending: true })
    ]);

    expect(component.anyPending()).toBe(false);
  });

  it('clearSelection unchecks every row and resets isAllSelected', () => {
    component.acc = makeAcc([makeTrx({ vmIsSelected: true }), makeTrx({ vmIsSelected: true })]);
    component.isAllSelected = true;

    component.clearSelection();

    expect(component.anySelected()).toBe(false);
    expect(component.isAllSelected).toBe(false);
  });

  it('clearSelection does not throw when there is no account yet', () => {
    component.acc = undefined as any;

    expect(() => component.clearSelection()).not.toThrow();
  });

  it('onDeleteAllSelected emits only the checked rows', () => {
    const selected = makeTrx({ vmIsSelected: true });
    const unselected = makeTrx({ vmIsSelected: false });
    component.acc = makeAcc([selected, unselected]);
    const emitSpy = jasmine.createSpy('emit');
    component.selectedDelete.emit = emitSpy;

    component.onDeleteAllSelected();

    expect(emitSpy).toHaveBeenCalledWith([selected]);
  });
});
