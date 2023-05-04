import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTrxComponent } from './view-trx.component';

describe('ViewTrxComponent', () => {
  let component: ViewTrxComponent;
  let fixture: ComponentFixture<ViewTrxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTrxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTrxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
