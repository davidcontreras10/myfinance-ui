import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPeriodDateComponent } from './set-period-date.component';

describe('SetPeriodDateComponent', () => {
  let component: SetPeriodDateComponent;
  let fixture: ComponentFixture<SetPeriodDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetPeriodDateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetPeriodDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
