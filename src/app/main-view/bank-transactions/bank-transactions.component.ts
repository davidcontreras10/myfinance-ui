import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BankTrxReqResp } from 'src/app/services/models';

@Component({
  selector: 'app-bank-transactions',
  templateUrl: './bank-transactions.component.html',
  styleUrls: ['./bank-transactions.component.css']
})
export class BankTransactionsComponent implements OnInit {

  @Input() bankTransactions: BankTrxReqResp[];

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit(): void {
    console.log('bankTransactions', this.bankTransactions);
  }

  submit(_t5: NgForm) {
    throw new Error('Method not implemented.');
  }
}
