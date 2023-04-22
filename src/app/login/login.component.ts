import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public username: string = '';
  public password: string = '';

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    const credentials = {
      username: this.username,
      password: this.password
    };
    this.authenticationService.getToken(credentials).subscribe();
  }

}
