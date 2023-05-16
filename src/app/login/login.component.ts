import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication-api.service';
import { TokenResponse } from '../services/models';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public username: string = '';
  public password: string = '';
  public errorMessage: string = '';

  constructor(private router: Router, private authenticationService: AuthenticationService, private authService: AuthService) { }

  ngOnInit(): void {
    this.username = '';
    this.password = '';
  }

  onSubmit(ngForm: any) {
    console.log('Form: ', ngForm);
    this.errorMessage = '';
    if (ngForm.valid) {
      const credentials = {
        username: this.username,
        password: this.password
      };
      this.authenticationService.getToken(credentials).subscribe({
        next: (token: TokenResponse) => {
          this.authenticate(token)
        },
        error: err => this.handleAuthError(err)
      });
    }
  }

  private handleAuthError(error: HttpErrorResponse) {
    this.errorMessage = 'Authentication error';
    console.error(error);
  }

  private authenticate(token: TokenResponse) {
    this.authService.authenticate(token);
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/'])
    }
  }
}
