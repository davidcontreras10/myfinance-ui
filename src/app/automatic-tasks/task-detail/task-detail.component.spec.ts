import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailComponent } from './task-detail.component';
import { IAutomaticTask, TaskStatus } from '../automatic-tasks.model';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Direct instantiation - onEditTask only touches the modal service and its
// own inputs/output, neither of which needs Angular's DI/rendering.
describe('TaskDetailComponent - onEditTask', () => {
  let component: TaskDetailComponent;
  let modalServiceSpy: jasmine.SpyObj<any>;
  let toasterServiceSpy: jasmine.SpyObj<any>;
  let modalRef: { componentInstance: any, result: Promise<any> };
  let resolveResult: (value?: any) => void;
  let rejectResult: (reason?: any) => void;

  function makeTask(overrides: Partial<IAutomaticTask> = {}): IAutomaticTask {
    return {
      id: 'task-1',
      description: 'Gasolina',
      accountId: 1,
      accountName: 'Gasolina M',
      amount: 100,
      currencySymbol: '₡',
      spendTypeId: 5,
      lastExecutedStatus: TaskStatus.Succeeded,
      frequencyType: 1,
      taskType: 1,
      days: [3],
      isPending: false,
      ...overrides
    } as IAutomaticTask;
  }

  beforeEach(() => {
    modalRef = {
      componentInstance: {},
      result: new Promise((resolve, reject) => {
        resolveResult = resolve;
        rejectResult = reject;
      })
    };
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    modalServiceSpy.open.and.returnValue(modalRef);
    toasterServiceSpy = jasmine.createSpyObj('ToasterService', ['success']);
    component = new TaskDetailComponent(null as any, null as any, modalServiceSpy, toasterServiceSpy);
  });

  it('does nothing when there is no selected task', () => {
    component.selectedTask = undefined as any;

    component.onEditTask();

    expect(modalServiceSpy.open).not.toHaveBeenCalled();
  });

  it('opens the edit modal with the selected task', () => {
    const task = makeTask();
    component.selectedTask = task;

    component.onEditTask();

    expect(modalServiceSpy.open).toHaveBeenCalled();
    expect(modalRef.componentInstance.task).toBe(task);
  });

  it('emits tasksModelChanged and shows a success toast after a successful save', async () => {
    component.selectedTask = makeTask();
    const emitSpy = jasmine.createSpy('emit');
    component.tasksModelChanged.emit = emitSpy;

    component.onEditTask();
    resolveResult('Saved');
    await modalRef.result.catch(() => { });

    expect(emitSpy).toHaveBeenCalled();
    expect(toasterServiceSpy.success).toHaveBeenCalled();
  });

  it('does not emit tasksModelChanged or show a toast when the modal is dismissed', async () => {
    component.selectedTask = makeTask();
    const emitSpy = jasmine.createSpy('emit');
    component.tasksModelChanged.emit = emitSpy;

    component.onEditTask();
    rejectResult('Cross click');
    await modalRef.result.catch(() => { });

    expect(emitSpy).not.toHaveBeenCalled();
    expect(toasterServiceSpy.success).not.toHaveBeenCalled();
  });
});
