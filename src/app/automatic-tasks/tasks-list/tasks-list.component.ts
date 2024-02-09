import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IAutomaticTask, TaskStatus } from '../automatic-tasks.model';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.css']
})
export class TasksListComponent implements OnInit {

  TaskStatus = TaskStatus;

  selectedTask: IAutomaticTask;

  @Input() tasks: IAutomaticTask[];
  @Output() selectedChanged = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  selectRow(task: IAutomaticTask) {
    this.selectedTask = task;
    this.onSelectedTasksChanged();
  }

  onSelectedTasksChanged() {
    if (this.selectedTask) {
      this.selectedChanged.emit(this.selectedTask);
    }
    else {
      this.selectedChanged.emit(null);
    }
  }
}
