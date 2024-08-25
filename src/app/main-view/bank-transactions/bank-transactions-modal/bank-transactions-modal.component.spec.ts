import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankTransactionsModalComponent } from './bank-transactions-modal.component';

describe('BankTransactionsModalComponent', () => {
  let component: BankTransactionsModalComponent;
  let fixture: ComponentFixture<BankTransactionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankTransactionsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankTransactionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
