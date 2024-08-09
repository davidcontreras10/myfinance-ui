import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BankTransactionStatus, BankTrxItemReqResp } from 'src/app/services/models';
import { BankTrxReqRespPair } from '../models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bank-transactions',
  templateUrl: './bank-transactions.component.html',
  styleUrls: ['./bank-transactions.component.css']
})
export class BankTransactionsComponent implements OnInit {

  @Input() bankTransactions: BankTrxReqRespPair[];

  selectedTransaction: BankTrxReqRespPair;
  selectedRowIndex: number | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['bankTransactions']) {
      this.bankTransactions = navigation?.extras?.state?.['bankTransactions'];
    }
  }

  ngOnInit(): void {
    console.log('bankTransactions', this.bankTransactions);
  }

  submit(_t5: NgForm) {
    throw new Error('Method not implemented.');
  }

  selectRow(index: number) {
    this.selectedRowIndex = index;
    this.selectedTransaction = this.bankTransactions[index];
  }

  set ignoreSelected(value: boolean) {
    if (this.selectedTransaction) {
      this.selectedTransaction.original.dbStatus = value ? BankTransactionStatus.Ignored : BankTransactionStatus.Processed;
    }
  }

  get ignoreSelected(): boolean {
    return this.selectedTransaction?.current.fileTransaction
      && this.selectedTransaction.current.dbStatus === BankTransactionStatus.Ignored;
  }

  set isMultipleTrx(value: boolean) {
    if (this.selectedTransaction) {
      this.selectedTransaction.multipleTrxReq = value;
    }
  }

  get isMultipleTrx(): boolean {
    return this.selectedTransaction && (this.selectedTransaction.multipleTrxReq || (this.selectedTransaction.current?.processData?.transactions?.length > 1))
  }


}
