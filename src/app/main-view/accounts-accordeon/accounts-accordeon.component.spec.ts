import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsAccordeonComponent } from './accounts-accordeon.component';

describe('AccountsAccordeonComponent', () => {
  let component: AccountsAccordeonComponent;
  let fixture: ComponentFixture<AccountsAccordeonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountsAccordeonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsAccordeonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
