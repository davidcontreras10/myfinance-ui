import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainSpinnerService {
  private spinnerStatus$ = new Subject<boolean>();

  constructor() { }

  public show() {
    this.spinnerStatus$.next(true);
  }

  public hide() {
    this.spinnerStatus$.next(false);
  }

  public listen(): Observable<boolean> {
    return this.spinnerStatus$.asObservable();
  }
}
