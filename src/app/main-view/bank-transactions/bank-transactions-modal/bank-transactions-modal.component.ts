import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BankTrxReqRespPair } from '../../models';

@Component({
  selector: 'app-bank-transactions-modal',
  templateUrl: './bank-transactions-modal.component.html',
  styleUrls: ['./bank-transactions-modal.component.css']
})
export class BankTransactionsModalComponent implements OnInit {

  @Input() bankTransactions: BankTrxReqRespPair[];

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  submit(_t5: NgForm) {
    throw new Error('Method not implemented.');
  }

}
