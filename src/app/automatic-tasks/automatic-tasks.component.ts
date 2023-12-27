import { Component, OnInit } from '@angular/core';
import { IAutomaticTask } from './automatic-tasks.model';
import { AutoTasksApiService } from '../services/auto-tasks-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-automatic-tasks',
  templateUrl: './automatic-tasks.component.html',
  styleUrls: ['./automatic-tasks.component.css']
})
export class AutomaticTasksComponent implements OnInit {

  public selectedTask!: IAutomaticTask;
  public loadedTasks!: IAutomaticTask[];

  constructor(private service: AutoTasksApiService, private router: Router) { }

  ngOnInit(): void {
    this._reloadScheduledTasks();
  }

  public onSelectedTaskChanged(selectedOption: IAutomaticTask): void {
    this.selectedTask = selectedOption;
  }
  public goToNew(): void {
    this.router.navigate(['/scheduled-tasks/new']);
  }

  public onTaskModelChanged() {
    this._reloadScheduledTasks();
  }

  private _setLoadedTasks(data: IAutomaticTask[]) {
    this.loadedTasks = [];
    this.loadedTasks = data;
  }

  private _reloadScheduledTasks() {
    this.service.getScheduledTasks()
      .subscribe(data => {
        this._setLoadedTasks(data);
      })
  }
}
