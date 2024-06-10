import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-set-period-date',
  templateUrl: './set-period-date.component.html',
  styleUrls: ['./set-period-date.component.css']
})
export class SetPeriodDateComponent implements OnInit {

  selectedDate: string;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  submit(_t5: NgForm) {
    if (this.selectedDate) {
      this.activeModal.close({
        value: new Date(this.selectedDate),
        success: true
      });
    }
  }
}
