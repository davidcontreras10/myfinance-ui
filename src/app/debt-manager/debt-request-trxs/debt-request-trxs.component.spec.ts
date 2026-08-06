import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtRequestTrxsComponent } from './debt-request-trxs.component';

describe('DebtRequestTrxsComponent', () => {
  let component: DebtRequestTrxsComponent;
  let fixture: ComponentFixture<DebtRequestTrxsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DebtRequestTrxsComponent]
    });
    fixture = TestBed.createComponent(DebtRequestTrxsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
