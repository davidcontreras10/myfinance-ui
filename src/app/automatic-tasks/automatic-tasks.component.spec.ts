import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomaticTasksComponent } from './automatic-tasks.component';

describe('AutomaticTasksComponent', () => {
  let component: AutomaticTasksComponent;
  let fixture: ComponentFixture<AutomaticTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomaticTasksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomaticTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
