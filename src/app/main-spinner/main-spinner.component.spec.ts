import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSpinnerComponent } from './main-spinner.component';

describe('MainSpinnerComponent', () => {
  let component: MainSpinnerComponent;
  let fixture: ComponentFixture<MainSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainSpinnerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
