import { Component } from '@angular/core';
import { ConfigService } from './services/config.service';
import { environment } from 'src/env/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'myfinance-ui';
  public envValue: boolean = environment.production;

  constructor(public configService: ConfigService) {
  }
}
