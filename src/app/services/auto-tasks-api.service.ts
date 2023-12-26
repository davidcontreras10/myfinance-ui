import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExecutedTask, IAutomaticTask } from '../automatic-tasks/automatic-tasks.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutoTasksApiService {

  constructor(private http: HttpClient) { }

  getExecutedTasks(taskId: string): Observable<ExecutedTask[]> {
    const url = `${environment.baseApi}/api/executedTasks`;
    const params = new HttpParams().set('taskId', taskId);
    return this.http.get<ExecutedTask[]>(url, { params: params });
  }

  getScheduledTasks(): Observable<IAutomaticTask[]> {
    const url = `${environment.baseApi}/api/ScheduledTasks/@current`;
    return this.http.get<IAutomaticTask[]>(url);
  }
}
