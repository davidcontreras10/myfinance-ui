import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditScheduledTaskComponent } from './edit-scheduled-task.component';
import { IAutomaticTask, TaskStatus } from '../automatic-tasks.model';
import { of } from 'rxjs';

describe('EditScheduledTaskComponent', () => {
  let component: EditScheduledTaskComponent;
  let fixture: ComponentFixture<EditScheduledTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditScheduledTaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditScheduledTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Direct instantiation - submit() only touches its inputs, the api service
// spy and activeModal spy, none of which need Angular's DI/rendering.
describe('EditScheduledTaskComponent - submit', () => {
  let component: EditScheduledTaskComponent;
  let activeModalSpy: jasmine.SpyObj<any>;
  let serviceSpy: jasmine.SpyObj<any>;
  let trxTypeServiceSpy: jasmine.SpyObj<any>;

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

  function makeControl(value: any, pristine: boolean) {
    return { value, pristine } as any;
  }

  beforeEach(() => {
    activeModalSpy = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
    serviceSpy = jasmine.createSpyObj('AutoTasksApiService', ['editScheduledTask']);
    serviceSpy.editScheduledTask.and.returnValue(of(undefined));
    trxTypeServiceSpy = jasmine.createSpyObj('TrxTypeServiceService', ['getUserTransactionTypes']);
    component = new EditScheduledTaskComponent(activeModalSpy, serviceSpy, trxTypeServiceSpy);
    component.task = makeTask();
  });

  it('dismisses without calling the API when nothing changed', () => {
    const form = { controls: {
      description: makeControl('Gasolina', true),
      amount: makeControl(100, true)
    } } as any;

    component.submit(form);

    expect(serviceSpy.editScheduledTask).not.toHaveBeenCalled();
    expect(activeModalSpy.dismiss).toHaveBeenCalledWith('No changes');
  });

  it('sends only the dirty fields, mapped to their ScheduledTaskField values', () => {
    const form = { controls: {
      description: makeControl('Gasolina', true),
      amount: makeControl(150, false),
      isPending: makeControl(true, false)
    } } as any;

    component.submit(form);

    expect(serviceSpy.editScheduledTask).toHaveBeenCalledWith('task-1', {
      amount: 150,
      isPending: true,
      modifyList: [1, 3]
    });
  });

  it('closes the modal after a successful save', () => {
    const form = { controls: {
      amount: makeControl(150, false)
    } } as any;

    component.submit(form);

    expect(activeModalSpy.close).toHaveBeenCalledWith('Saved');
  });

  it('maps every editable field to its ScheduledTaskField value', () => {
    const form = { controls: {
      description: makeControl('New name', false),
      amount: makeControl(200, false),
      spendType: makeControl(9, false),
      isPending: makeControl(true, false)
    } } as any;

    component.submit(form);

    expect(serviceSpy.editScheduledTask).toHaveBeenCalledWith('task-1', {
      description: 'New name',
      amount: 200,
      spendTypeId: 9,
      isPending: true,
      modifyList: [4, 1, 2, 3]
    });
  });

  it('does nothing when there is no task', () => {
    component.task = undefined as any;
    const form = { controls: { amount: makeControl(150, false) } } as any;

    component.submit(form);

    expect(serviceSpy.editScheduledTask).not.toHaveBeenCalled();
    expect(activeModalSpy.dismiss).not.toHaveBeenCalled();
  });

  it('sends frequencyType and days together when the frequency radio changes', () => {
    component.selectedFreqType = 2;
    component.selectedDayOfWeek = 5;
    const form = { controls: {
      frqType: makeControl(2, false)
    } } as any;

    component.submit(form);

    expect(serviceSpy.editScheduledTask).toHaveBeenCalledWith('task-1', {
      frequencyType: 2,
      days: [5],
      modifyList: [5, 6]
    });
  });

  it('sends frequencyType and days together when only the day changes (frequency untouched)', () => {
    component.selectedFreqType = 1;
    component.selectedDayOfMonth = 20;
    const form = { controls: {
      dayOfMonth: makeControl(20, false)
    } } as any;

    component.submit(form);

    expect(serviceSpy.editScheduledTask).toHaveBeenCalledWith('task-1', {
      frequencyType: 1,
      days: [20],
      modifyList: [5, 6]
    });
  });

  it('sends only frequencyType, no days, when switching to Manual', () => {
    component.selectedFreqType = 3;
    const form = { controls: {
      frqType: makeControl(3, false)
    } } as any;

    component.submit(form);

    expect(serviceSpy.editScheduledTask).toHaveBeenCalledWith('task-1', {
      frequencyType: 3,
      modifyList: [5]
    });
  });

  it('combines frequency/day changes with simple field changes in one request', () => {
    component.selectedFreqType = 2;
    component.selectedDayOfWeek = 0;
    const form = { controls: {
      amount: makeControl(150, false),
      frqType: makeControl(2, false)
    } } as any;

    component.submit(form);

    expect(serviceSpy.editScheduledTask).toHaveBeenCalledWith('task-1', {
      amount: 150,
      frequencyType: 2,
      days: [0],
      modifyList: [1, 5, 6]
    });
  });
});

// Direct instantiation - ngOnInit only touches its inputs and the
// TrxTypeServiceService spy, neither of which needs Angular's DI/rendering.
describe('EditScheduledTaskComponent - ngOnInit', () => {
  let component: EditScheduledTaskComponent;
  let trxTypeServiceSpy: jasmine.SpyObj<any>;

  beforeEach(() => {
    trxTypeServiceSpy = jasmine.createSpyObj('TrxTypeServiceService', ['getUserTransactionTypes']);
    trxTypeServiceSpy.getUserTransactionTypes.and.returnValue(of([
      { id: 2, name: 'Gasolina', isDefault: false, isSelected: false },
      { id: 1, name: 'Ahorro', isDefault: true, isSelected: true }
    ]));
    component = new EditScheduledTaskComponent(null as any, null as any, trxTypeServiceSpy);
    component.task = { id: 'task-1', spendTypeId: 1 } as any;
  });

  it('requests every one of the user\'s transaction types, not just the default-selected ones', () => {
    component.ngOnInit();

    expect(trxTypeServiceSpy.getUserTransactionTypes).toHaveBeenCalledWith(true);
  });

  it('sorts the loaded spend types by name', () => {
    component.ngOnInit();

    expect(component.spendTypes.map(t => t.name)).toEqual(['Ahorro', 'Gasolina']);
  });

  it('preselects the task\'s current spend type', () => {
    component.ngOnInit();

    expect(component.selectedSpendTypeId).toBe(1);
  });

  it('preselects the frequency type and day of month for a monthly task', () => {
    component.task = { id: 'task-1', frequencyType: 1, days: [15] } as any;

    component.ngOnInit();

    expect(component.selectedFreqType).toBe(1);
    expect(component.selectedDayOfMonth).toBe(15);
    expect(component.selectedDayOfWeek).toBeUndefined();
  });

  it('preselects the frequency type and day of week for a weekly task', () => {
    component.task = { id: 'task-1', frequencyType: 2, days: [0] } as any;

    component.ngOnInit();

    expect(component.selectedFreqType).toBe(2);
    expect(component.selectedDayOfWeek).toBe(0);
    expect(component.selectedDayOfMonth).toBeUndefined();
  });

  it('preselects Manual with no day prefilled', () => {
    component.task = { id: 'task-1', frequencyType: 3, days: [] } as any;

    component.ngOnInit();

    expect(component.selectedFreqType).toBe(3);
    expect(component.selectedDayOfMonth).toBeUndefined();
    expect(component.selectedDayOfWeek).toBeUndefined();
  });
});
