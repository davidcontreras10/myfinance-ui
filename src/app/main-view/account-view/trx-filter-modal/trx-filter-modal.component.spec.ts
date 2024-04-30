import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrxFilterModalComponent } from './trx-filter-modal.component';

describe('TrxFilterModalComponent', () => {
  let component: TrxFilterModalComponent;
  let fixture: ComponentFixture<TrxFilterModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrxFilterModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrxFilterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
