import { ComponentFixture, TestBed } from '@angular/core/testing';

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
