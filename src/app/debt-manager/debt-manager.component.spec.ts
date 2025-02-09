import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtManagerComponent } from './debt-manager.component';

describe('DebtManagerComponent', () => {
  let component: DebtManagerComponent;
  let fixture: ComponentFixture<DebtManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
