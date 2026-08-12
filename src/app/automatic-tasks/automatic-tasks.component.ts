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
  public searchTerm = '';

  constructor(private service: AutoTasksApiService, private router: Router) { }

  ngOnInit(): void {
    this._reloadScheduledTasks();
  }

  // Filtered client-side, in memory - getScheduledTasks() already returns the
  // full list with no server-side pagination/search, so there is no API to
  // call here.
  public get filteredTasks(): IAutomaticTask[] {
    if (!this.loadedTasks) {
      return [];
    }
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.loadedTasks;
    }
    return this.loadedTasks.filter(task =>
      task.description?.toLowerCase().includes(term) ||
      task.accountName?.toLowerCase().includes(term));
  }

  public clearSearch(): void {
    this.searchTerm = '';
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
