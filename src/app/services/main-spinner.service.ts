import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainSpinnerService {
  private spinnerStatus$ = new Subject<boolean>();
  private showRequests = 0;

  constructor() { }

  public show() {
    this.showRequests++;
    this.spinnerStatus$.next(true);
  }

  public hide() {
    if (this.showRequests <= 0) {
      this.showRequests = 0;
    }
    else {
      this.showRequests--;
    }
    if (this.showRequests === 0) {
      this.spinnerStatus$.next(false);
    }
  }

  public listen(): Observable<boolean> {
    return this.spinnerStatus$.asObservable();
  }
}
