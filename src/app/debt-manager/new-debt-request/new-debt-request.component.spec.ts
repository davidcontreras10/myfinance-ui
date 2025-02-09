import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDebtRequestComponent } from './new-debt-request.component';

describe('NewDebtRequestComponent', () => {
  let component: NewDebtRequestComponent;
  let fixture: ComponentFixture<NewDebtRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewDebtRequestComponent]
    });
    fixture = TestBed.createComponent(NewDebtRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
