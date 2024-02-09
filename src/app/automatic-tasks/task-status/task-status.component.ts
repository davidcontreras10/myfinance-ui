import { Component, Input, OnInit } from '@angular/core';
import { TaskStatus } from '../automatic-tasks.model';

@Component({
  selector: 'app-task-status',
  templateUrl: './task-status.component.html',
  styleUrls: ['./task-status.component.css']
})
export class TaskStatusComponent implements OnInit {

  TaskStatus = TaskStatus;

  @Input() taskStatus: TaskStatus = TaskStatus.Unknown;

  constructor() { }

  ngOnInit(): void {
  }

  public getStatus(status: TaskStatus) {
    if (status === TaskStatus.Unknown) {
      return '-';
    }
    return TaskStatus[status];
  }

}
