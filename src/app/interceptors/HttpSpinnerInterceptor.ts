import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { MainSpinnerService } from '../services/main-spinner.service';

@Injectable()
export class HttpSpinnerInterceptor implements HttpInterceptor {

    constructor(private spinnerService: MainSpinnerService) {

    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.headers.get('x-skip-interceptor') === 'true') {
            return next.handle(request);
        }
        this.spinnerService.show();
        return next.handle(request).pipe(
            finalize(() => {
                this.spinnerService.hide();
            })
        );
    }
} 