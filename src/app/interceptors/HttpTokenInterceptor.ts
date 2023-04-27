import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService } from "../auth.service";
import { Injectable } from "@angular/core";

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authToken = this.authService.getToken();
        if (authToken) {
            const authReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${authToken}`)
            });
            return next.handle(authReq);
        }

        return next.handle(req);
    }

}