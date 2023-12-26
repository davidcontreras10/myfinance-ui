import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IAutomaticTask, TaskStatus } from '../automatic-tasks.model';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.css']
})
export class TasksListComponent implements OnInit {

  TaskStatus = TaskStatus;

  selectedTasks!: IAutomaticTask[];

  @Input() tasks: IAutomaticTask[];
  @Output() selectedChanged = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
