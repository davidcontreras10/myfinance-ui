import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { HttpEventNotifierService } from '../services/http-event-notifier.service';

@Injectable()
export class HttpNotifyInterceptor implements HttpInterceptor {


  constructor(private eventNotifier: HttpEventNotifierService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.eventNotifier.notifyBefore();
    return next.handle(request).pipe(
      finalize(() => {
        this.eventNotifier.listenAfter();
      })
    );
  }
}
