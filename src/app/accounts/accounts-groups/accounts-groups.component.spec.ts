import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsGroupsComponent } from './accounts-groups.component';

describe('AccountsGroupsComponent', () => {
  let component: AccountsGroupsComponent;
  let fixture: ComponentFixture<AccountsGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountsGroupsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
