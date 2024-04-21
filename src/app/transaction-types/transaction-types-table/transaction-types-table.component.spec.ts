import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionTypesTableComponent } from './transaction-types-table.component';

describe('TransactionTypesTableComponent', () => {
  let component: TransactionTypesTableComponent;
  let fixture: ComponentFixture<TransactionTypesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionTypesTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionTypesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
