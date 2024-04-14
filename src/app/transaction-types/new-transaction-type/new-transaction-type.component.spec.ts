import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTransactionTypeComponent } from './new-transaction-type.component';

describe('NewTransactionTypeComponent', () => {
  let component: NewTransactionTypeComponent;
  let fixture: ComponentFixture<NewTransactionTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewTransactionTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewTransactionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
