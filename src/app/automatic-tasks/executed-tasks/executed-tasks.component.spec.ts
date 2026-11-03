import { ExecutedTasksComponent } from './executed-tasks.component';
import { IAutomaticTask } from '../automatic-tasks.model';
import { ScheduledExecutionAttemptHistoryEntry, ScheduledExecutionAttemptHistoryPage } from 'src/app/services/auto-tasks-api.service';
import { SimpleChange } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';

describe('ExecutedTasksComponent', () => {
  let component: ExecutedTasksComponent;
  let service: jasmine.SpyObj<any>;
  let executedTasksChangedMessage: Subject<string>;

  const task = { id: 'task-1' } as IAutomaticTask;
  const attempt = (id: string, attemptNumber = 1): ScheduledExecutionAttemptHistoryEntry => ({
    id,
    actorId: 'owner-1',
    occurrenceId: null,
    manualRequestId: `request-${id}`,
    attemptNumber,
    postingDate: '2026-10-17',
    startedAtUtc: '2026-10-17T12:00:00Z',
    endedAtUtc: '2026-10-17T12:00:01Z',
    status: 3,
    failureStage: 'FinancialWork',
    failureType: 'ServiceException',
    failureMessage: 'Safe failure summary'
  });

  const page = (items: ScheduledExecutionAttemptHistoryEntry[], hasMore = false): ScheduledExecutionAttemptHistoryPage => ({
    items, skip: 0, limit: 50, hasMore
  });

  beforeEach(() => {
    service = jasmine.createSpyObj('AutoTasksApiService', ['getExecutedTasks', 'getExecutionAttempts']);
    service.getExecutedTasks.and.returnValue(of([]));
    service.getExecutionAttempts.and.returnValue(of(page([])));
    executedTasksChangedMessage = new Subject<string>();
    component = new ExecutedTasksComponent(service, { executedTasksChangedMessage } as any);
    component.selectedTask = task;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the selected task attempt history and exposes safe failure details', () => {
    service.getExecutionAttempts.and.returnValue(of(page([attempt('attempt-1')])));

    component.ngOnChanges({ selectedTask: new SimpleChange(undefined, task, true) });

    expect(service.getExecutionAttempts).toHaveBeenCalledWith('task-1', 0, 50);
    expect(component.attemptDataSource?.[0].failureMessage).toBe('Safe failure summary');
    expect(component.attemptStatusName(4)).toBe('Interrupted');
  });

  it('loads further pages using the number of attempts already shown', () => {
    const firstPage = Array.from({ length: 50 }, (_, index) => attempt(`attempt-${index}`, index + 1));
    service.getExecutionAttempts.and.returnValues(of(page(firstPage, true)), of(page([attempt('attempt-50')])));

    component.ngOnChanges({ selectedTask: new SimpleChange(undefined, task, true) });
    component.loadMoreAttempts();

    expect(service.getExecutionAttempts.calls.allArgs()).toEqual([
      ['task-1', 0, 50], ['task-1', 50, 50]
    ]);
    expect(component.attemptDataSource?.length).toBe(51);
    expect(component.attemptsHasMore).toBeFalse();
  });

  it('shows attempts as unavailable when the API gates the feature', () => {
    service.getExecutionAttempts.and.returnValue(throwError(() => ({ status: 503 })));

    component.ngOnChanges({ selectedTask: new SimpleChange(undefined, task, true) });

    expect(component.attemptsUnavailable).toBeTrue();
    expect(component.attemptDataSource).toBeNull();
  });
});
