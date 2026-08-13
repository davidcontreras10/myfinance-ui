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
    this._reselectCurrentTask();
  }

  // Every reload (after edit/delete/run) fetches a brand new array of task
  // objects - selectedTask would otherwise keep pointing at the old,
  // now-detached instance, so the detail panel would go on showing pre-edit
  // values. Re-point it at the refreshed object with the same id (or clear
  // it if that task no longer exists, e.g. after a delete).
  private _reselectCurrentTask(): void {
    if (this.selectedTask) {
      this.selectedTask = this.loadedTasks.find(task => task.id === this.selectedTask.id) as IAutomaticTask;
    }
  }

  private _reloadScheduledTasks() {
    this.service.getScheduledTasks()
      .subscribe(data => {
        this._setLoadedTasks(data);
      })
  }
}
