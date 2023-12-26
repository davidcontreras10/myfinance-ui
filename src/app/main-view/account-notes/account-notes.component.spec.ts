import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNotesComponent } from './account-notes.component';

describe('AccountNotesComponent', () => {
  let component: AccountNotesComponent;
  let fixture: ComponentFixture<AccountNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountNotesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
