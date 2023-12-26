import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExecutedTask, ExecutedTaskResult, IAutomaticTask } from '../automatic-tasks/automatic-tasks.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutoTasksApiService {

  constructor(private http: HttpClient) { }

  executeTask(taskId: string): Observable<ExecutedTaskResult> {
    const url = `${environment.baseApi}/api/ScheduledTasks/${taskId}/execution`;
    const model = {
      requestType: 1,
      dateTime: new Date()
    };

    return this.http.post<ExecutedTaskResult>(url, model);
  }

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
