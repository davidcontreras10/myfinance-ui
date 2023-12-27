import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AutomaticTaskType, FrequencyType, IAutomaticTask, SpInAutomaticTask, TransferAutomaticTask } from '../automatic-tasks.model';
import { AutoTasksApiService } from 'src/app/services/auto-tasks-api.service';
import { AutoTasksMessageBus } from '../auto-tasks-message-bus';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit, OnChanges {

  @Input() selectedTask!: IAutomaticTask;
  @Output() tasksModelChanged = new EventEmitter();

  public showRecords: boolean = false;

  private viewRecordsId: string = "";
  private weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(private service: AutoTasksApiService, private messageBus: AutoTasksMessageBus) { }
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
  public onExecuteTask() {
    if (this.selectedTask && confirm("Are you sure to run the transaction now?")) {
      this.service.executeTask(this.selectedTask.id)
        .subscribe(res => {
          this.tasksModelChanged.emit();
          this.messageBus.executedTasksChangedMessage.next(this.selectedTask.id);
        })
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
      return `${basicTask.currencySymbol}${basicTask.amount} ${!basicTask.isSpend ? 'Income' : 'Spend'} ${this._getFrequencyText(task)}`;
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
    if (task.frequencyType === FrequencyType.Monthly && day && day > 0) {
      return `every ${day}${this._getMonthDayPrefix(day)} of the month`;
    }

    if (task.frequencyType === FrequencyType.Weekly && day && day >= 0 && day < 7) {
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
