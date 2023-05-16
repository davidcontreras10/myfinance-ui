import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserError } from './models'

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.css']
})
export class ErrorModalComponent implements OnInit {

  @Input() error?: any;
  constructor(public activeModal: NgbActiveModal) { }

  get errorType(): 0 | 1 | 2 {
    if (!this.error) {
      return 0;
    }

    if (this.error instanceof UserError) {
      return 1;
    }

    return 2;
  }

  ngOnInit(): void {
    if (this.error) {
      console.error(this.error);
    }
  }

}
