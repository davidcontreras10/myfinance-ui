import { Component, OnInit } from '@angular/core';
import { IAutomaticTask } from './automatic-tasks.model';

@Component({
  selector: 'app-automatic-tasks',
  templateUrl: './automatic-tasks.component.html',
  styleUrls: ['./automatic-tasks.component.css']
})
export class AutomaticTasksComponent implements OnInit {

  public selectedTask!: IAutomaticTask;
  public loadedTasks!: IAutomaticTask[];

  constructor() { }

  ngOnInit(): void {
  }

  public onSelectedTaskChanged(selectedOption: IAutomaticTask): void {
    this.selectedTask = selectedOption;
  }
  public goToNew(): void {
  }
}
