import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  AutoTasksApiService,
  ScheduledExecutionAttemptHistoryEntry
} from 'src/app/services/auto-tasks-api.service';
import { AutoTasksMessageBus } from '../auto-tasks-message-bus';
import { ExecutedTask, IAutomaticTask } from '../automatic-tasks.model';

@Component({
  standalone: false,
  selector: 'app-executed-tasks',
  templateUrl: './executed-tasks.component.html',
  styleUrls: ['./executed-tasks.component.css']
})
export class ExecutedTasksComponent implements OnInit, OnChanges, OnDestroy {

  private static readonly AttemptPageSize = 50;
  private readonly destroyed = new Subject<void>();
  private attemptRequestGeneration = 0;

  @Input()
  selectedTask!: IAutomaticTask

  public displayedColumns: string[] = ['executedDate', 'status', 'message'];
  public dataSource!: ExecutedTask[];
  public attemptDataSource: ScheduledExecutionAttemptHistoryEntry[] | null = null;
  public attemptsHasMore = false;
  public attemptsLoading = false;
  public attemptsUnavailable = false;
  public attemptsFailed = false;

  constructor(private service: AutoTasksApiService, private messageBus: AutoTasksMessageBus) { }

  ngOnInit(): void {
    this.messageBus.executedTasksChangedMessage.pipe(takeUntil(this.destroyed)).subscribe((taskId) => {
      if (taskId === this.selectedTask?.id) this.loadHistory();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTask'] && this.selectedTask?.id !== changes['selectedTask'].previousValue?.id) {
      this.loadHistory();
    }
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public loadMoreAttempts(): void {
    if (!this.attemptsHasMore || this.attemptsLoading) return;
    this.loadAttempts(this.selectedTask.id, false);
  }

  public attemptStatusName(status: number): string {
    switch (status) {
      case 1: return 'In progress';
      case 2: return 'Succeeded';
      case 3: return 'Failed';
      case 4: return 'Interrupted';
      default: return 'Unknown';
    }
  }

  private loadHistory(): void {
    const taskId = this.selectedTask?.id;
    if (!taskId) return;

    this.attemptRequestGeneration++;
    this.attemptsLoading = false;
    this.service.getExecutedTasks(taskId).pipe(takeUntil(this.destroyed)).subscribe({
      next: tasks => {
        if (this.selectedTask?.id === taskId) this.dataSource = tasks;
      },
      error: this._onServiceError.bind(this)
    });
    this.attemptDataSource = [];
    this.attemptsHasMore = false;
    this.attemptsUnavailable = false;
    this.attemptsFailed = false;
    this.loadAttempts(taskId, true);
  }

  private loadAttempts(taskId: string, reset: boolean): void {
    if (this.attemptsLoading && !reset) return;
    const requestGeneration = ++this.attemptRequestGeneration;
    const skip = reset ? 0 : this.attemptDataSource?.length || 0;
    this.attemptsLoading = true;
    this.service.getExecutionAttempts(taskId, skip, ExecutedTasksComponent.AttemptPageSize)
      .pipe(takeUntil(this.destroyed)).subscribe({
      next: page => {
        if (requestGeneration !== this.attemptRequestGeneration || this.selectedTask?.id !== taskId) return;
        const previous = reset ? [] : this.attemptDataSource || [];
        this.attemptDataSource = [...previous, ...page.items];
        this.attemptsHasMore = page.hasMore;
        this.attemptsUnavailable = false;
        this.attemptsFailed = false;
        this.attemptsLoading = false;
      },
      error: error => {
        if (requestGeneration !== this.attemptRequestGeneration || this.selectedTask?.id !== taskId) return;
        this.attemptsLoading = false;
        if (error?.status === 404 || error?.status === 503) {
          this.attemptsUnavailable = true;
          this.attemptDataSource = null;
          return;
        }
        this.attemptsFailed = true;
        console.error(error);
      }
      });
  }

  private _onServiceError(error: any) {
    console.error(error);
  }
}
