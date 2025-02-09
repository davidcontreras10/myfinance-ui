import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtorActionsComponent } from './debtor-actions.component';

describe('ActionsComponent', () => {
  let component: DebtorActionsComponent;
  let fixture: ComponentFixture<DebtorActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DebtorActionsComponent]
    });
    fixture = TestBed.createComponent(DebtorActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
