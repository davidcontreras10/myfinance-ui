import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BankTransactionsComponent } from './bank-transactions.component';
import { BankTransactionStatus, BankTrxProcessResponse, BankTrxSpendSummaryResponse } from 'src/app/services/models';

describe('BankTransactionsComponent', () => {
  let component: BankTransactionsComponent;
  let fixture: ComponentFixture<BankTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankTransactionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// The suite above relies on Angular's TestBed to provide BankTransactionsComponent's
// dependencies (MainViewApiService -> HttpClient, ActivatedRoute, Router), which it
// currently does not (pre-existing gap, unrelated to the spend-summary feature).
// The suite below instantiates the component directly with mocked dependencies so the
// new auto-refreshing spend-summary logic can be tested without that harness.
describe('BankTransactionsComponent - spend summary auto-refresh', () => {
  let component: BankTransactionsComponent;
  let mainViewApiServiceSpy: { getBankTrxSpendSummary: jasmine.Spy };
  let routerSpy: { getCurrentNavigation: jasmine.Spy; navigate: jasmine.Spy };
  let activatedRouteStub: { queryParams: any };
  let trxTypeServiceSpy: { getUserTransactionTypes: jasmine.Spy };

  const emptySummary: BankTrxSpendSummaryResponse = { currencies: [], banks: [] };

  function makeTrx(dbStatus: BankTransactionStatus, transactionId: string, financialEntityId = 1): any {
    return {
      original: { dbStatus, fileTransaction: { transactionId }, financialEntityId },
      current: { dbStatus, fileTransaction: { transactionId }, financialEntityId },
      resetRequested: false
    };
  }

  beforeEach(() => {
    mainViewApiServiceSpy = {
      getBankTrxSpendSummary: jasmine.createSpy('getBankTrxSpendSummary').and.returnValue(of(emptySummary))
    };
    routerSpy = {
      getCurrentNavigation: jasmine.createSpy('getCurrentNavigation').and.returnValue(null),
      navigate: jasmine.createSpy('navigate')
    };
    activatedRouteStub = { queryParams: of({}) };
    trxTypeServiceSpy = {
      getUserTransactionTypes: jasmine.createSpy('getUserTransactionTypes').and.returnValue(of([]))
    };

    component = new BankTransactionsComponent(
      routerSpy as any,
      mainViewApiServiceSpy as any,
      activatedRouteStub as any,
      trxTypeServiceSpy as any
    );
  });

  it('does not call the summary API when no rows are Processed', () => {
    component.bankTransactions = [makeTrx(BankTransactionStatus.Inserted, 'a')];

    expect(mainViewApiServiceSpy.getBankTrxSpendSummary).not.toHaveBeenCalled();
    expect(component.spendSummary).toBeNull();
  });

  it('calls the summary API with the transactionId + financialEntityId of only the Processed rows', () => {
    component.bankTransactions = [
      makeTrx(BankTransactionStatus.Processed, 'a', 10),
      makeTrx(BankTransactionStatus.Inserted, 'b', 20),
      makeTrx(BankTransactionStatus.Processed, 'c', 30)
    ];

    expect(mainViewApiServiceSpy.getBankTrxSpendSummary).toHaveBeenCalledWith([
      { transactionId: 'a', financialEntityId: 10 },
      { transactionId: 'c', financialEntityId: 30 }
    ]);
  });

  it('stores the API response in spendSummary and clears the loading flag', () => {
    const response: BankTrxSpendSummaryResponse = {
      currencies: [{ id: 1, symbol: '$', name: 'Dollar', isDefault: true, isSelected: true }],
      banks: [{ financialEntityId: 1, financialEntityName: 'Bac San Jose', accounts: [] }]
    };
    mainViewApiServiceSpy.getBankTrxSpendSummary.and.returnValue(of(response));

    component.bankTransactions = [makeTrx(BankTransactionStatus.Processed, 'a')];

    expect(component.spendSummary).toEqual(response);
    expect(component.spendSummaryLoading).toBe(false);
  });

  it('clears spendSummary when bankTransactions is reassigned with no Processed rows (e.g. Clear Transactions)', () => {
    mainViewApiServiceSpy.getBankTrxSpendSummary.and.returnValue(of(emptySummary));
    component.bankTransactions = [makeTrx(BankTransactionStatus.Processed, 'a')];
    expect(mainViewApiServiceSpy.getBankTrxSpendSummary).toHaveBeenCalledTimes(1);

    component.bankTransactions = [];

    expect(component.spendSummary).toBeNull();
    expect(mainViewApiServiceSpy.getBankTrxSpendSummary).toHaveBeenCalledTimes(1);
  });

  it('re-triggers the summary after a submit response flips a row to Processed in place', () => {
    component.bankTransactions = [makeTrx(BankTransactionStatus.Inserted, 'a', 7)];
    expect(mainViewApiServiceSpy.getBankTrxSpendSummary).not.toHaveBeenCalled();

    const processResponse: BankTrxProcessResponse = {
      bankTransactions: [
        {
          financialEntityId: 7,
          fileTransaction: { transactionId: 'a', originalAmount: 100, transactionDate: new Date(), description: 'x', currencyCode: 'USD' },
          dbStatus: BankTransactionStatus.Processed,
          currency: { id: 1, name: 'Dollar', symbol: '$', isDefault: true, isSelected: true },
          singleTrxAccountId: 1,
          singleTrxTypeId: 2,
          singleTrxIsPending: false,
          processData: { transactions: [{ accountId: 1, spendId: 1, spendDate: new Date(), setPaymentDate: null, spendTypeId: 2, originalAmount: 100, amountCurrencyId: 1, description: 'x', convertedAmount: 100, accounts: [], isPending: false }] }
        }
      ],
      itemModifieds: []
    };

    (component as any).processBankTrxProcessResponse(processResponse);

    expect(mainViewApiServiceSpy.getBankTrxSpendSummary).toHaveBeenCalledWith([
      { transactionId: 'a', financialEntityId: 7 }
    ]);
  });

  it('logs but does not throw when the summary API errors', () => {
    mainViewApiServiceSpy.getBankTrxSpendSummary.and.returnValue({
      subscribe: (handlers: any) => handlers.error({ message: 'boom' })
    });

    expect(() => {
      component.bankTransactions = [makeTrx(BankTransactionStatus.Processed, 'a')];
    }).not.toThrow();
    expect(component.spendSummaryLoading).toBe(false);
  });

  describe('getStatusBadgeClass', () => {
    it('gives Processed a success badge', () => {
      expect(component.getStatusBadgeClass(BankTransactionStatus.Processed)).toBe('text-bg-success');
    });

    it('gives Ignored a secondary badge', () => {
      expect(component.getStatusBadgeClass(BankTransactionStatus.Ignored)).toBe('text-bg-secondary');
    });

    it('gives Inserted (New) a primary badge', () => {
      expect(component.getStatusBadgeClass(BankTransactionStatus.Inserted)).toBe('text-bg-primary');
    });

    it('gives NotExisting the same badge as Inserted, matching getStatusName treating them alike', () => {
      expect(component.getStatusBadgeClass(BankTransactionStatus.NotExisting)).toBe('text-bg-primary');
    });

    it('falls back to a neutral badge for Unknown', () => {
      expect(component.getStatusBadgeClass(BankTransactionStatus.Unknown)).toBe('text-bg-light');
    });
  });
});
