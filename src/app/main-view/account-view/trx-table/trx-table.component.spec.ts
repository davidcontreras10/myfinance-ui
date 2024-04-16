import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrxTableComponent } from './trx-table.component';

describe('TrxTableComponent', () => {
  let component: TrxTableComponent;
  let fixture: ComponentFixture<TrxTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrxTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrxTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
