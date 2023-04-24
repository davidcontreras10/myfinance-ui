import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreSpinnerComponent } from './core-spinner.component';

describe('CoreSpinnerComponent', () => {
  let component: CoreSpinnerComponent;
  let fixture: ComponentFixture<CoreSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreSpinnerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
