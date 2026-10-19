import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AutomaticTaskType, FrequencyType, IAutomaticTask, SpInAutomaticTask, TaskStatus, TransferAutomaticTask } from '../automatic-tasks.model';
import { AutoTasksApiService } from 'src/app/services/auto-tasks-api.service';
import { AutoTasksMessageBus } from '../auto-tasks-message-bus';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditScheduledTaskComponent } from '../edit-scheduled-task/edit-scheduled-task.component';
import { ToasterService } from 'src/app/services/toaster.service';
import { RunScheduledTaskModalComponent, RunScheduledTaskChoice } from '../run-scheduled-task-modal/run-scheduled-task-modal.component';
import { ScheduledTaskExecutionContext } from 'src/app/services/auto-tasks-api.service';
import { PendingScheduledExecutionIntent, ScheduledExecutionIntentStore } from 'src/app/services/scheduled-execution-intent.store';

@Component({
  standalone: false,
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit, OnChanges {

  @Input() selectedTask!: IAutomaticTask;
  @Output() tasksModelChanged = new EventEmitter();

  public showRecords: boolean = false;
  public executionBusy = false;

  private viewRecordsId: string = "";
  private weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private service: AutoTasksApiService,
    private messageBus: AutoTasksMessageBus,
    private modalService: NgbModal,
    private toasterService: ToasterService,
    private executionIntentStore: ScheduledExecutionIntentStore = new ScheduledExecutionIntentStore()
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.showRecords = !!this.selectedTask?.id && !!this.viewRecordsId && this.viewRecordsId === this.selectedTask.id;
  }

  ngOnInit(): void {
  }

  public onViewRecordsClicked(): void {
    if (this.selectedTask?.id) {
      this.showRecords = true;
      this.viewRecordsId = this.selectedTask.id;
    } else {
      this.showRecords = false;
      this.viewRecordsId = "";
    }
  }
  public onExecuteTask(): void {
    const task = this.selectedTask;
    if (!task?.id || this.executionBusy) return;
    this.executionBusy = true;

    let pending: PendingScheduledExecutionIntent | null;
    try {
      pending = this.executionIntentStore.get(task.id);
    } catch (error) {
      this.executionBusy = false;
      this.toasterService.failure(this.errorMessage(error));
      return;
    }

    if (pending) {
      this.openRunDialog(task, null, pending);
      return;
    }

    this.service.getExecutionContext(task.id).subscribe({
      next: context => this.openRunDialog(task, context, null),
      error: error => {
        if (this.usesLegacyExecution(error)) {
          this.runLegacy(task.id);
          return;
        }
        this.executionBusy = false;
        this.toasterService.failure(this.errorMessage(error));
      },
    });
  }

  private openRunDialog(
    task: IAutomaticTask,
    context: ScheduledTaskExecutionContext | null,
    pendingIntent: PendingScheduledExecutionIntent | null
  ): void {
    const modalRef = this.modalService.open(RunScheduledTaskModalComponent, {
      backdrop: 'static', keyboard: false, centered: true,
    });
    modalRef.componentInstance.task = task;
    modalRef.componentInstance.context = context;
    modalRef.componentInstance.pendingIntent = pendingIntent;
    modalRef.result.then((choice: RunScheduledTaskChoice) => {
      if (choice.retry && pendingIntent) {
        this.submitV2(pendingIntent);
        return;
      }
      try {
        const intent = this.createIntent(task.id, context, choice.action);
        this.executionIntentStore.save(intent);
        this.submitV2(intent);
      } catch (error) {
        this.executionBusy = false;
        this.toasterService.failure(this.errorMessage(error));
      }
    }, () => {
      this.executionBusy = false;
    });
  }

  private createIntent(
    taskId: string,
    context: ScheduledTaskExecutionContext | null,
    action: PendingScheduledExecutionIntent['action']
  ): PendingScheduledExecutionIntent {
    if (!context) throw new Error('The scheduled task context is unavailable.');
    if (action === 'occurrence') {
      if (!context.today || context.today.status !== 1)
        throw new Error("Today's scheduled occurrence is no longer pending. Refresh the task and try again.");
      return {
        taskId, action, displayDate: context.today.scheduledLocalDate.slice(0, 10),
        input: { occurrenceId: context.today.id },
      };
    }

    const postingDate = context.localDate.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(postingDate))
      throw new Error('The API returned an invalid local posting date.');
    return {
      taskId, action, displayDate: postingDate,
      input: { manualRequestId: this.newManualRequestId(), postingDate: `${postingDate}T00:00:00` },
    };
  }

  private newManualRequestId(): string {
    if (typeof crypto === 'undefined' || !crypto.randomUUID)
      throw new Error('This browser cannot create a secure run identity. No request was sent.');
    return crypto.randomUUID();
  }

  private submitV2(intent: PendingScheduledExecutionIntent): void {
    this.service.executeTaskV2(intent.taskId, intent.input).subscribe({
      next: result => {
        this.executionIntentStore.clear(intent.taskId);
        this.executionBusy = false;
        this.tasksModelChanged.emit();
        this.messageBus.executedTasksChangedMessage.next(intent.taskId);
        this.toasterService.success(result.alreadyCompleted
          ? 'This run had already completed.'
          : 'Scheduled task completed');
      },
      error: error => {
        this.executionBusy = false;
        this.toasterService.failure(`${this.errorMessage(error)} The same run is saved for a safe retry.`);
      },
    });
  }

  private runLegacy(taskId: string): void {
    if (!confirm('Are you sure to run the transaction now?')) {
      this.executionBusy = false;
      return;
    }
    this.service.executeTask(taskId).subscribe({
      next: result => {
        this.executionBusy = false;
        this.tasksModelChanged.emit();
        this.messageBus.executedTasksChangedMessage.next(taskId);
        if (result.status === TaskStatus.Failed) this.toasterService.failure(result.errorMsg || 'Task execution failed.');
        else this.toasterService.success('Scheduled task completed');
      },
      error: error => {
        this.executionBusy = false;
        this.toasterService.failure(this.errorMessage(error));
      },
    });
  }

  private usesLegacyExecution(error: any): boolean {
    const message = error?.error?.message;
    return error?.status === 404 ||
      (error?.status === 503 && message === 'Schedule history is not enabled.');
  }

  private errorMessage(error: any): string {
    if (error instanceof Error) return error.message;
    if (error?.status === 0) return 'The server could not be reached.';
    return error?.error?.message || 'The scheduled task could not be run.';
  }

  public onEditTask() {
    if (this.selectedTask) {
      const modalRef = this.modalService.open(EditScheduledTaskComponent, { backdrop: 'static', keyboard: false });
      modalRef.componentInstance.task = this.selectedTask;
      modalRef.result.then(() => {
        this.tasksModelChanged.emit();
        this.toasterService.success('Scheduled task updated');
      }, () => {
        // dismissed without saving - nothing to refresh
      });
    }
  }

  public onDeleteTask() {
    if (this.selectedTask) {
      if (confirm("Are you sure to delete scheduled task")) {
        this.service.deleteScheduledTask(this.selectedTask.id)
          .subscribe(data => {
            this._onDeleted(data);
          })
      }
    }
  }

  public getDesc(task: IAutomaticTask): string {
    if (task.taskType === AutomaticTaskType.SpIn) {
      const basicTask = task as SpInAutomaticTask;
      return `${basicTask.currencySymbol}${basicTask.amount}${basicTask.isPending ? ' pending ' : ' '}${!basicTask.isSpend ? 'Income' : 'Spend'} ${this._getFrequencyText(task)}`;
    }

    if (task.taskType === AutomaticTaskType.Trasnfer) {
      const transTask = task as unknown as TransferAutomaticTask;
      return `${transTask.currencySymbol}${transTask.amount} to ${transTask.toAccountName} ${this._getFrequencyText(task)}`;
    }

    return 'Unknown task type';
  }

  private _onDeleted(data: any) {
    this.tasksModelChanged.emit();
  }

  private _getFrequencyText(task: IAutomaticTask): string {
    const day = task.days?.length > 0 ? task.days[0] : null;
    if (task.frequencyType === FrequencyType.Manual) {
      return 'on manual execution';
    }

    if (task.frequencyType === FrequencyType.Monthly && day && day > 0) {
      return `every ${day}${this._getMonthDayPrefix(day)} of the month`;
    }

    if (task.frequencyType === FrequencyType.Weekly && day !== null && day >= 0 && day < this.weekDays.length) {
      return `every ${this.weekDays[day]}`
    }
    return 'Frequency not set';
  }

  private _onServiceError(error: any) {
    console.error(error);
  }

  private _getMonthDayPrefix(d: number): string {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }
}
