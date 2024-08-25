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
