import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AutomaticTasksComponent } from './automatic-tasks.component';
import { IAutomaticTask, TaskStatus } from './automatic-tasks.model';

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

// Direct instantiation - filteredTasks/clearSearch only touch plain inputs,
// neither needs Angular's DI/rendering.
describe('AutomaticTasksComponent - search', () => {
  let component: AutomaticTasksComponent;

  function makeTask(overrides: Partial<IAutomaticTask> = {}): IAutomaticTask {
    return {
      id: '1',
      description: 'Cambio de Aceite',
      accountId: 1,
      accountName: 'General Bac',
      amount: 100,
      currencySymbol: '₡',
      lastExecutedStatus: TaskStatus.Succeeded,
      frequencyType: 1,
      taskType: 1,
      days: [3],
      isPending: false,
      ...overrides
    } as IAutomaticTask;
  }

  beforeEach(() => {
    component = new AutomaticTasksComponent(null as any, null as any);
  });

  it('filteredTasks returns an empty array when no tasks have loaded yet', () => {
    expect(component.filteredTasks).toEqual([]);
  });

  it('filteredTasks returns every task when the search term is empty', () => {
    const tasks = [makeTask({ id: '1' }), makeTask({ id: '2' })];
    component.loadedTasks = tasks;

    expect(component.filteredTasks).toEqual(tasks);
  });

  it('filteredTasks matches on description, case-insensitively', () => {
    const match = makeTask({ id: '1', description: 'Gasolina' });
    const other = makeTask({ id: '2', description: 'Prestamo Prado' });
    component.loadedTasks = [match, other];
    component.searchTerm = 'GASO';

    expect(component.filteredTasks).toEqual([match]);
  });

  it('filteredTasks matches on accountName, case-insensitively', () => {
    const match = makeTask({ id: '1', accountName: 'Otros Carro' });
    const other = makeTask({ id: '2', accountName: 'Gastos M' });
    component.loadedTasks = [match, other];
    component.searchTerm = 'otros';

    expect(component.filteredTasks).toEqual([match]);
  });

  it('filteredTasks returns an empty array when nothing matches', () => {
    component.loadedTasks = [makeTask({ description: 'Gasolina' })];
    component.searchTerm = 'no such task';

    expect(component.filteredTasks).toEqual([]);
  });

  it('clearSearch empties the search term', () => {
    component.searchTerm = 'gasolina';

    component.clearSearch();

    expect(component.searchTerm).toBe('');
  });
});

// Direct instantiation - onTaskModelChanged only touches the api service
// spy and the component's own inputs, neither of which needs Angular's
// DI/rendering.
describe('AutomaticTasksComponent - reselect after reload', () => {
  let component: AutomaticTasksComponent;
  let serviceSpy: jasmine.SpyObj<any>;

  function makeTask(overrides: Partial<IAutomaticTask> = {}): IAutomaticTask {
    return {
      id: '1',
      description: 'Cambio de Aceite',
      accountId: 1,
      accountName: 'General Bac',
      amount: 100,
      currencySymbol: '₡',
      lastExecutedStatus: TaskStatus.Succeeded,
      frequencyType: 1,
      taskType: 1,
      days: [3],
      isPending: false,
      ...overrides
    } as IAutomaticTask;
  }

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('AutoTasksApiService', ['getScheduledTasks']);
    component = new AutomaticTasksComponent(serviceSpy, null as any);
  });

  it('re-points selectedTask at the refreshed object with the same id', () => {
    const staleSelection = makeTask({ id: '1', description: 'Gasolina', amount: 100 });
    component.selectedTask = staleSelection;
    const refreshed = makeTask({ id: '1', description: 'Gasolina', amount: 250 });
    serviceSpy.getScheduledTasks.and.returnValue(of([refreshed, makeTask({ id: '2' })]));

    component.onTaskModelChanged();

    expect(component.selectedTask).toBe(refreshed);
    expect(component.selectedTask.amount).toBe(250);
  });

  it('clears selectedTask when it no longer exists after reload (e.g. deleted)', () => {
    component.selectedTask = makeTask({ id: '1' });
    serviceSpy.getScheduledTasks.and.returnValue(of([makeTask({ id: '2' })]));

    component.onTaskModelChanged();

    expect(component.selectedTask).toBeUndefined();
  });

  it('leaves selectedTask alone when nothing was selected', () => {
    component.selectedTask = undefined as any;
    serviceSpy.getScheduledTasks.and.returnValue(of([makeTask({ id: '1' })]));

    component.onTaskModelChanged();

    expect(component.selectedTask).toBeUndefined();
  });
});
