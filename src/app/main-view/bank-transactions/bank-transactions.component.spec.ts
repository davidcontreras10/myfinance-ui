import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankTransactionsComponent } from './bank-transactions.component';

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
