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
    if (wasZero) this._status$.next(true);
  }

  hide(): void {
    if (this.showRequests > 0) this.showRequests--;
    if (this.showRequests === 0) this._status$.next(false);
  }
}
