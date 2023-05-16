import { Injectable } from '@angular/core';
import { Subject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpEventNotifierService {

  private notifier$ = new Subject<'before' | 'after'>();

  constructor() { }

  public notifyAfter() {
    this.notifier$.next("after");
  }

  public notifyBefore() {
    this.notifier$.next("before");
  }

  public listenAfter() {
    return this.notifier$.pipe(
      filter(n => n === 'after')
    );
  }

  public listenBefore() {
    return this.notifier$.pipe(
      filter(n => n === 'before')
    );
  }
}
