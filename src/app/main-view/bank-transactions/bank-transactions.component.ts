import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BankTransactionStatus, BankTrxItemReqResp, BankTrxProcessResponse, ClientBankItemRequest, SelectableItem } from 'src/app/services/models';
import { BankTrxReqRespPair } from '../models';
import { Router } from '@angular/router';
import { MainViewApiService } from 'src/app/services/main-view-api.service';
import { Utils } from 'src/app/utils';

@Component({
  selector: 'app-bank-transactions',
  templateUrl: './bank-transactions.component.html',
  styleUrls: ['./bank-transactions.component.css']
})
export class BankTransactionsComponent implements OnInit {

  BankTransactionStatus = BankTransactionStatus;

  @Input() bankTransactions: BankTrxReqRespPair[];

  selectedTransaction: BankTrxReqRespPair;
  selectedRowIndex: number | null = null;
  transactionTypes: SelectableItem[] = [];

  constructor(private router: Router, private mainViewApiService: MainViewApiService) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['bankTransactions']) {
      this.bankTransactions = navigation?.extras?.state?.['bankTransactions'];
    }
  }

  ngOnInit(): void {
    this.mainViewApiService.getUserTransactionTypes().subscribe(response => {
      this.transactionTypes = response;
    });
  }

  submit(_t5: NgForm) {
    console.log('Submitting changes', _t5);
    const submitValues = this.getClientBankItemRequests();
    console.log('submitValues', submitValues);
    if (submitValues.length === 0) {
      return;
    }

    this.mainViewApiService.submitBankTrxChanges(submitValues).subscribe(response => {
      this.processBankTrxProcessResponse(response);
    });
  }

  requestReset() {
    if (confirm('Are you sure you want to reset this transaction?')) {
      this.mainViewApiService.resetBankTrx(this.selectedTransaction.current.fileTransaction.transactionId,
        this.selectedTransaction.current.financialEntityId).subscribe(response => {
          this.processBankTrxProcessResponse(response);
        });
    }
  }

  selectRow(index: number) {
    this.selectedRowIndex = index;
    this.selectedTransaction = this.bankTransactions[index];
  }

  getEnumText(value: BankTransactionStatus): string {
    return BankTransactionStatus[value];
  }

  getStatusName(value: BankTransactionStatus): string {
    if (value === BankTransactionStatus.Inserted) {
      return 'New';
    }

    return this.getEnumText(value);
  }

  getClientBankItemRequests(): ClientBankItemRequest[] {
    const values: ClientBankItemRequest[] = [];
    this.bankTransactions.forEach(trx => {
      if (this.isIgnoreRequested(trx)) {
        values.push(this.createIgnoreRequest(trx));
        return;
      }
      if (this.isAlreadyProcessed(trx)) {
        return;
      }
      if (trx.multipleTrxReq) {
        values.push(this.createMultipleTrxRequest(trx));
        return;
      }
      else {
        values.push(this.createSingleTrxRequest(trx));
      }
    });

    return values;
  }
  createSingleTrxRequest(trx: BankTrxReqRespPair): ClientBankItemRequest {
    const current = trx.current;
    return {
      transactionId: current.fileTransaction.transactionId,
      financialEntityId: current.financialEntityId,
      requestIgnore: false,
      description: current.fileTransaction.description,
      isMultipleTrx: false,
      accountId: current.singleTrxAccountId,
      spendTypeId: current.singleTrxTypeId,
      isPending: current.singleTrxIsPending,
      transactions: []
    }
  }
  createMultipleTrxRequest(trx: BankTrxReqRespPair): ClientBankItemRequest {
    throw new Error('Method not implemented.');
  }

  private processBankTrxProcessResponse(response: BankTrxProcessResponse): void {
    const newBankTransactions = response.bankTransactions;
    this.bankTransactions.forEach(trx => {
      const newTrx = newBankTransactions.find(t => t.fileTransaction.transactionId === trx.current.fileTransaction.transactionId);
      if (!newTrx) {
        return;
      }

      if (newTrx.processData?.transactions?.length === 1) {
        newTrx.singleTrxAccountId = newTrx.processData.transactions[0].accountId;
        newTrx.singleTrxTypeId = newTrx.processData.transactions[0].spendTypeId;
        newTrx.singleTrxIsPending = newTrx.processData.transactions[0].isPending
      }
      else {
        newTrx.singleTrxAccountId = null;
        newTrx.singleTrxTypeId = 1;
        newTrx.singleTrxIsPending = false;
      }
      const copy = Utils.deepClone(newTrx);
      trx.current = newTrx;
      trx.original = copy;
      trx.resetRequested = false;
      trx.multipleTrxReq = false;
    });
  }

  private createIgnoreRequest(trx: BankTrxReqRespPair): ClientBankItemRequest {
    const current = trx.current;
    return {
      transactionId: current.fileTransaction.transactionId,
      financialEntityId: current.financialEntityId,
      requestIgnore: true,
      description: current.fileTransaction.description,
      isMultipleTrx: null,
      accountId: null,
      spendTypeId: null,
      isPending: null,
      transactions: []
    }
  }

  private isAlreadyProcessed(item: BankTrxReqRespPair): boolean {
    return item.original.dbStatus === BankTransactionStatus.Processed && !item.resetRequested;
  }

  private isIgnoreRequested(item: BankTrxReqRespPair): boolean {
    return item.current.dbStatus === BankTransactionStatus.Ignored;
  }

  set ignoreSelected(value: boolean) {
    if (this.selectedTransaction) {
      this.selectedTransaction.current.dbStatus = value ? BankTransactionStatus.Ignored : BankTransactionStatus.Inserted;
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
