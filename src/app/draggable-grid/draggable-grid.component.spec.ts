import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableGridComponent } from './draggable-grid.component';

describe('DraggableGridComponent', () => {
  let component: DraggableGridComponent;
  let fixture: ComponentFixture<DraggableGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DraggableGridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraggableGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
