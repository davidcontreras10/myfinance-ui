import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainViewPrefsComponent } from './main-view-prefs.component';

describe('MainViewPrefsComponent', () => {
  let component: MainViewPrefsComponent;
  let fixture: ComponentFixture<MainViewPrefsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainViewPrefsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainViewPrefsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
