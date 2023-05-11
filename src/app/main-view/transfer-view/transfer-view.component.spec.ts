import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferViewComponent } from './transfer-view.component';

describe('TransferViewComponent', () => {
  let component: TransferViewComponent;
  let fixture: ComponentFixture<TransferViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
