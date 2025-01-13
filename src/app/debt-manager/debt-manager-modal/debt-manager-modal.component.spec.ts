import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtManagerModalComponent } from './debt-manager-modal.component';

describe('DebtManagerModalComponent', () => {
  let component: DebtManagerModalComponent;
  let fixture: ComponentFixture<DebtManagerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtManagerModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtManagerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
