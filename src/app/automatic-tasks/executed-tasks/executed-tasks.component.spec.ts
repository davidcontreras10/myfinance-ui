import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutedTasksComponent } from './executed-tasks.component';

describe('ExecutedTasksComponent', () => {
  let component: ExecutedTasksComponent;
  let fixture: ComponentFixture<ExecutedTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExecutedTasksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutedTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
