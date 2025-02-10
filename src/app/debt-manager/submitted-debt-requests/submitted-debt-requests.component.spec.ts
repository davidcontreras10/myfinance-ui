import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedDebtRequestsComponent } from './submitted-debt-requests.component';

describe('SubmittedDebtRequestsComponent', () => {
  let component: SubmittedDebtRequestsComponent;
  let fixture: ComponentFixture<SubmittedDebtRequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubmittedDebtRequestsComponent]
    });
    fixture = TestBed.createComponent(SubmittedDebtRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
