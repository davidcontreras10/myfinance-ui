import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccGroupComponent } from './acc-group.component';

describe('AccGroupComponent', () => {
  let component: AccGroupComponent;
  let fixture: ComponentFixture<AccGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
