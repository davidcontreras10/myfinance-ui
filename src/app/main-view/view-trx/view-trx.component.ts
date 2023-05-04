import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-trx',
  templateUrl: './view-trx.component.html',
  styleUrls: ['./view-trx.component.css']
})
export class ViewTrxComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
