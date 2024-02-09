import { Component, Input, OnInit } from '@angular/core';
import { AutoTasksApiService } from 'src/app/services/auto-tasks-api.service';
import { AutoTasksMessageBus } from '../auto-tasks-message-bus';
import { ExecutedTask, IAutomaticTask } from '../automatic-tasks.model';

@Component({
  selector: 'app-executed-tasks',
  templateUrl: './executed-tasks.component.html',
  styleUrls: ['./executed-tasks.component.css']
})
export class ExecutedTasksComponent implements OnInit {

  @Input()
  selectedTask!: IAutomaticTask

  public displayedColumns: string[] = ['executedDate', 'status', 'message'];
  public dataSource!: ExecutedTask[];

  constructor(private service: AutoTasksApiService, private messageBus: AutoTasksMessageBus) { }

  ngOnInit(): void {
    this.messageBus.executedTasksChangedMessage.subscribe((taskId) => {
      this._loadExecutedTasks();
    });
  }
  private _loadExecutedTasks() {
    if (this.selectedTask) {
      this.service.getExecutedTasks(this.selectedTask.id).subscribe({
        next: this._executedTasksReceived.bind(this),
        error: this._onServiceError.bind(this)
      })
    }
  }

  private _executedTasksReceived(tasks: ExecutedTask[]) {
    this.dataSource = tasks;
  }

  private _onServiceError(error: any) {
    console.error(error);
  }
}
