import { Component, Input, OnInit } from '@angular/core';
import { MainSpinnerService } from '../services/main-spinner.service';

@Component({
  selector: 'app-main-spinner',
  templateUrl: './main-spinner.component.html',
  styleUrls: ['./main-spinner.component.css']
})
export class MainSpinnerComponent implements OnInit {

  public showSpinner = false;
  constructor(service: MainSpinnerService) {
    service.listen().subscribe((value) => {
      this.showSpinner = value;
    })
  }

  ngOnInit(): void {
  }


}
