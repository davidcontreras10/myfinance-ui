import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountViewComponent } from './account-view.component';

describe('AccountViewComponent', () => {
  let component: AccountViewComponent;
  let fixture: ComponentFixture<AccountViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Direct instantiation (no TestBed) - onBankTrxView only touches the Router
// and window.open, neither of which needs Angular's DI/rendering. Mirrors the
// pattern already established for TrxTableComponent/BankTransactionsComponent.
describe('AccountViewComponent - view bank record', () => {
  let component: AccountViewComponent;
  let routerSpy: { createUrlTree: jasmine.Spy; serializeUrl: jasmine.Spy };
  let windowOpenSpy: jasmine.Spy;

  beforeEach(() => {
    routerSpy = {
      createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({} as any),
      serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('/bank-trx?trxId=42')
    };
    windowOpenSpy = spyOn(window, 'open');

    component = new AccountViewComponent(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      routerSpy as any
    );
  });

  it('opens the linked bank transaction in a new tab rather than navigating away', () => {
    component.onBankTrxView({ spendId: 42 } as any);

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/bank-trx'], { queryParams: { trxId: 42 } });
    expect(routerSpy.serializeUrl).toHaveBeenCalled();
    expect(windowOpenSpy).toHaveBeenCalledWith('/bank-trx?trxId=42', '_blank');
  });

  it('does nothing when there is no transaction', () => {
    component.onBankTrxView(null as any);

    expect(windowOpenSpy).not.toHaveBeenCalled();
  });
});
