import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MainSpinnerService {
  private showRequests = 0;

  private readonly _status$ = new BehaviorSubject<boolean>(false);
  /** Public, read-only stream */
  readonly status$: Observable<boolean> = this._status$.pipe(distinctUntilChanged());

  show(): void {
    const wasZero = this.showRequests === 0;
    this.showRequests++;
    // Defer to a microtask so this doesn't emit synchronously mid change-detection
    // pass (e.g. when an HTTP call fires from another component's ngOnInit),
    // which would otherwise trigger NG0100 on the OnPush main-spinner component.
    if (wasZero) Promise.resolve().then(() => this._status$.next(true));
  }

  hide(): void {
    if (this.showRequests > 0) this.showRequests--;
    if (this.showRequests === 0) this._status$.next(false);
  }
}
