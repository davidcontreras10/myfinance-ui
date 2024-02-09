import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
export class AutoTasksMessageBus{
    executedTasksChangedMessage: BehaviorSubject<string> = new BehaviorSubject('');
}