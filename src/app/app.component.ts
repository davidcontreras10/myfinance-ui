import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthGuard } from './auth.guard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthGuard]
})
export class AppComponent {
  title = 'myfinance-ui';

  constructor() {
  }
}
