import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MainSpinnerService } from '../services/main-spinner.service';

@Component({
  selector: 'app-main-spinner',
  templateUrl: './main-spinner.component.html',
  styleUrls: ['./main-spinner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainSpinnerComponent {
  constructor(public service: MainSpinnerService) { }
}
