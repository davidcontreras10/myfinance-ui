import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAutomaticTask } from '../automatic-tasks/automatic-tasks.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutoTasksApiService {

  constructor(private http: HttpClient) { }

  getScheduledTasks(): Observable<IAutomaticTask[]> {
    const url = `${environment.baseApi}/api/ScheduledTasks/@current`;
    return this.http.get<IAutomaticTask[]>(url);
  }
}
