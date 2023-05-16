import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrxAmountComponent } from './trx-amount.component';

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
