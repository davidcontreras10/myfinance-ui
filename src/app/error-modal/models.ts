import { HttpErrorResponse } from "@angular/common/http";

export class UserError {
    userMessage?: string;
    innerException?: Error;

    public static fromHttpErrorResponse(httpResponseError: HttpErrorResponse): UserError {
        const error = new UserError();
        error.innerException = httpResponseError;
        error.userMessage = 'Service Error';

        return error;
    }
}
