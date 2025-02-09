import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-debt-manager-modal',
  templateUrl: './debt-manager-modal.component.html',
  styleUrls: ['./debt-manager-modal.component.css']
})
export class DebtManagerModalComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
