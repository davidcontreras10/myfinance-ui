import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrxComponent } from './add-trx.component';

describe('AddTrxComponent', () => {
  let component: AddTrxComponent;
  let fixture: ComponentFixture<AddTrxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTrxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTrxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
