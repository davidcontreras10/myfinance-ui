import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BasicOption, ExecutedTask, ExecutedTaskResult, IAutomaticTask, UserSelectAccount } from '../automatic-tasks/automatic-tasks.model';
import { environment } from 'src/environments/environment';
import { BasicNewScheduledTask, TransferNewScheduledTask } from '../automatic-tasks/new-scheduled-task/models';

@Injectable({
  providedIn: 'root'
})
export class AutoTasksApiService {

  constructor(private http: HttpClient) { }

  createTransfer(model: TransferNewScheduledTask): Observable<void> {
    const url = `${environment.baseApi}/api/ScheduledTasks/transfer`;
    return this.http.post<void>(url, model);
  }

  createBasic(model: BasicNewScheduledTask): Observable<void> {
    const url = `${environment.baseApi}/api/ScheduledTasks/basic`;
    return this.http.post<void>(url, model);
  }

  getAddSpendData(accountPeriodId: number): Observable<any | null> {
    const params = new HttpParams().set('accountPeriodIds', accountPeriodId);
    const url = `${environment.baseApi}/api/spends/add`;
    return this.http.get<any[]>(url, { params: params })
      .pipe(
        map(res => {
          return res.find(x => x.accountPeriodId === accountPeriodId)
        })
      );
  }

  getDestinationAccounts(accountPeriodId: number, currencyId: number): Observable<BasicOption[]> {
    const url = `${environment.baseApi}/api/transfers/possibleDestination`;
    const params = new HttpParams()
      .set('accountPeriodId', accountPeriodId)
      .set('currencyId', currencyId)
      .set('balanceType', 1);
    return this.http.get<BasicOption[]>(url, { params: params });
  }

  getUserAccounts(): Observable<UserSelectAccount[]> {
    const url = `${environment.baseApi}/api/accounts/list`;
    return this.http.get<any[]>(url)
      .pipe(
        map(items => {
          return items.map((item: any) => {
            return {
              accountId: item.accountId,
              accountName: item.accountName,
              accountPeriodId: item.accountPeriodId
            }
          })
        })
      )
  }

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

  deleteScheduledTask(taskId: string): Observable<void> {
    const url = `${environment.baseApi}/api/ScheduledTasks/${taskId}`;
    return this.http.delete<void>(url);
  }
}
