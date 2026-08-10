import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankTrxMultipleComponent } from './bank-trx-multiple.component';

describe('BankTrxMultipleComponent', () => {
  let component: BankTrxMultipleComponent;
  let fixture: ComponentFixture<BankTrxMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankTrxMultipleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankTrxMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Direct instantiation (no TestBed) - addAppTrx() only touches selectedTransaction and
// the trxAdded emitter, neither of which needs Angular's DI/rendering.
describe('BankTrxMultipleComponent.addAppTrx', () => {
  it('adds a split and emits trxAdded so the parent can scroll it into view', () => {
    const component = new BankTrxMultipleComponent();
    const addTrxSpy = jasmine.createSpy('addTrx');
    component.selectedTransaction = { addTrx: addTrxSpy } as any;
    const emitSpy = spyOn(component.trxAdded, 'emit');

    component.addAppTrx();

    expect(addTrxSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('does not emit trxAdded when there is no selected transaction', () => {
    const component = new BankTrxMultipleComponent();
    component.selectedTransaction = null;
    const emitSpy = spyOn(component.trxAdded, 'emit');

    component.addAppTrx();

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
