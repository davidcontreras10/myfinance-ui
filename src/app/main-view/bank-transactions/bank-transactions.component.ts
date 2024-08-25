import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BankTransactionStatus, BankTrxItemReqResp, BankTrxProcessResponse, BankTrxReqResp, BankTrxSpendViewModel, ClientBankItemRequest, ClientBankTrxRequest, SelectableItem } from 'src/app/services/models';
import { BankTrxReqRespPair } from '../models';
import { ActivatedRoute, Router } from '@angular/router';
import { MainViewApiService } from 'src/app/services/main-view-api.service';
import { Utils } from 'src/app/utils';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-bank-transactions',
  templateUrl: './bank-transactions.component.html',
  styleUrls: ['./bank-transactions.component.css']
})
export class BankTransactionsComponent implements OnInit {

  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef;
  @Input() bankTransactions: BankTrxReqRespPair[];
  selectedFile: File | null = null;

  BankTransactionStatus = BankTransactionStatus;

  searchCriteriaId: any | null = '1';
  searchCriteriaTextValue: string = '';
  searchCriteariaDateValue: any | null = null;
  selectedTransaction: BankTrxReqRespPair | null = null;
  searchOptions: SelectableItem[] = this.getSearchOptions();
  searchCriteriaDateValue: string | null = null;

  transactionTypes: SelectableItem[] = [];


  public statusOrder: { [key in number]: number } = {
    [BankTransactionStatus.Inserted]: 1,
    [BankTransactionStatus.Processed]: 2,
    [BankTransactionStatus.Ignored]: 3,
    [BankTransactionStatus.NotExisting]: 4,
    [BankTransactionStatus.Unknown]: 5
  };

  constructor(private router: Router,
    private mainViewApiService: MainViewApiService,
    private activatedRoute: ActivatedRoute) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['uploadedFile']) {
      this.selectedFile = navigation?.extras?.state?.['uploadedFile'];
    }
  }

  search() {
    if (this.searchCriteriaId === '1' && this.searchCriteriaTextValue) {
      this.mainViewApiService.getTrxByRefNumber(this.searchCriteriaTextValue).subscribe({
        next: (response) => {
          this.handleSearchResponse(response);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Upload error:', err.message);
        }
      });
    }
    else if (this.searchCriteriaId === '2') {
      if (this.searchCriteriaDateValue) {
        const [year, month, day] = this.searchCriteriaDateValue.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        this.mainViewApiService.getTrxByDate(date).subscribe({
          next: (response) => {
            this.handleSearchResponse(response);
          },
          error: (err: HttpErrorResponse) => {
            console.error('Upload error:', err.message);
          }
        });
      }
      else {
        // handle error
      }
    }
    else if (this.searchCriteriaId === '3' && this.searchCriteriaTextValue) {
      this.mainViewApiService.getTrxByDescription(this.searchCriteriaTextValue).subscribe({
        next: (response) => {
          this.handleSearchResponse(response);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Upload error:', err.message);
        }
      });
    }
  }

  private handleSearchResponse(response: BankTrxReqResp): void {
    this.resetSearchControls();
    this.processBankTrxReqResp(response);
  }

  resetSearchControls() {
    this.searchCriteriaId = '1';
    this.searchCriteriaTextValue = '';
    this.searchCriteriaDateValue = null;
  }

  onAccountChange($event: Event, bankTrxReqRespPair: BankTrxReqRespPair) {
    const strSeletedAccountId = bankTrxReqRespPair.current.singleTrxAccountId as any;
    const seletedAccountId = parseInt(strSeletedAccountId);
    if (!seletedAccountId) {
      return;
    }

    const selectedAccount = bankTrxReqRespPair.accounts.find(a => a.id === seletedAccountId);
    if (!selectedAccount) {
      return;
    }

    bankTrxReqRespPair.current.singleTrxTypeId = selectedAccount.trxTypeId ?? 1;
  }

  ngOnInit(): void {
    this.mainViewApiService.getUserTransactionTypes().subscribe(response => {
      this.transactionTypes = response;
    });

    if (this.selectedFile) {
      this.onUploadBankTrxFile();
    }

    this.activatedRoute.queryParams.subscribe(params => {
      const trxId = params['trxId'];
      if (trxId) {
        this.mainViewApiService.getBankTransactionsByAppTrxIds([trxId]).subscribe({
          next: (event) => {
            this.processBankTrxReqResp(event);
          },
          error: (err: HttpErrorResponse) => {
            console.error('Upload error:', err.message);
          }
        });
      }
    });

  }

  submit(_t5: NgForm) {
    const submitValues = this.getClientBankItemRequests();
    if (submitValues.length === 0) {
      return;
    }

    this.selectRow(null);
    this.mainViewApiService.submitBankTrxChanges(submitValues).subscribe(response => {
      this.processBankTrxProcessResponse(response);
    });
  }

  getSearchOptions(): SelectableItem[] {
    return [
      { id: 1, name: 'Reference Number', isSelected: false, isDefault: false },
      { id: 2, name: 'Date', isSelected: false, isDefault: false },
      { id: 3, name: 'Description', isSelected: false, isDefault: false }
    ];
  }

  clearTransactions() {
    this.bankTransactions = [];
    this.selectRow(null);
    this.router.navigate(['/bank-trx']);
  }

  requestDelete() {
    if (confirm('Are you sure you want to delete this transaction?') && this.selectedTransaction) {
      this.mainViewApiService.deleteBankTrx(this.selectedTransaction.current.fileTransaction.transactionId,
        this.selectedTransaction.current.financialEntityId).subscribe(response => {
          if (this.selectedTransaction) {
            const index = this.bankTransactions.indexOf(this.selectedTransaction);
            if (index > -1) {
              this.bankTransactions.splice(index, 1);
              this.selectRow(null);
            }
          }
        });
    }
  }

  requestReset() {
    if (confirm('Are you sure you want to reset this transaction?') && this.selectedTransaction) {
      this.mainViewApiService.resetBankTrx(this.selectedTransaction.current.fileTransaction.transactionId,
        this.selectedTransaction.current.financialEntityId).subscribe(response => {
          this.processBankTrxProcessResponse(response);
        });
    }
  }

  onBankTrxFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.onUploadBankTrxFile();
    }
  }

  onUploadBankTrxFile(): void {
    if (this.selectedFile) {
      const uploadedFile = this.selectedFile;
      this.selectedFile = null;
      this.fileInput.nativeElement.value = '';
      this.mainViewApiService.uploadBankTrxFile(uploadedFile).subscribe({
        next: (event) => {
          this.processHttpBankTrxReqResp(event);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Upload error:', err.message);
        }
      });
    }
  }

  processHttpBankTrxReqResp(event: HttpEvent<BankTrxReqResp>): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        // Calculate the progress percentage and display it if needed
        const progress = Math.round((100 * event.loaded) / (event.total ?? 1));
        console.log(`File is ${progress}% uploaded.`);
        break;
      case HttpEventType.Response:
        const responseBody: BankTrxReqResp = event.body!;
        this.processBankTrxReqResp(responseBody);
        break;
    }
  }

  processBankTrxReqResp(responseBody: BankTrxReqResp): void {
    const viewModel = this.transformBankTrxUploadResponse(responseBody);
    if (viewModel) {
      this.bankTransactions = viewModel;
    }
  }

  openBankTrxFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  selectRow(row: BankTrxReqRespPair | null): void {
    this.selectedTransaction = row;
  }

  getEnumText(value: BankTransactionStatus): string {
    return BankTransactionStatus[value];
  }

  getStatusName(value: BankTransactionStatus): string {
    if (value === BankTransactionStatus.Inserted) {
      return 'New';
    }

    if (value === BankTransactionStatus.NotExisting) {
      value = BankTransactionStatus.Inserted;
    }
    return this.getEnumText(value);
  }

  getClientBankItemRequests(): ClientBankItemRequest[] {
    const values: ClientBankItemRequest[] = [];
    this.bankTransactions.forEach(trx => {
      if (this.isIgnoreRequested(trx)) {
        if (trx.original.dbStatus === BankTransactionStatus.Ignored) {
          return;
        }
        values.push(this.createIgnoreRequest(trx));
        return;
      }
      if (this.isAlreadyProcessed(trx)) {
        return;
      }
      if (trx.isMultipleTrx) {
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
      transactions: [],
      transactionDate: trx.getTrxDate()
    }
  }
  createMultipleTrxRequest(trx: BankTrxReqRespPair): ClientBankItemRequest {
    const current = trx.current;
    if (current.processData?.transactions?.length < 2) {
      throw new Error("No transactions found");
    }

    const transactions: ClientBankTrxRequest[] = current.processData.transactions.map(t => {
      return {
        amount: Utils.validateNumber(t.originalAmount),
        isPending: t.isPending,
        spendTypeId: Utils.validateId(t.spendTypeId),
        accountId: Utils.validateId(t.accountId),
        description: t.description
      }
    });
    const bankTrx: ClientBankItemRequest = {
      accountId: null,
      description: current.fileTransaction.description,
      financialEntityId: current.financialEntityId,
      isMultipleTrx: true,
      isPending: null,
      requestIgnore: false,
      spendTypeId: null,
      transactionId: current.fileTransaction.transactionId,
      transactions: transactions,
      transactionDate: trx.getTrxDate()
    };

    return bankTrx;
  }

  private processBankTrxProcessResponse(response: BankTrxProcessResponse): void {
    const newBankTransactions = response.bankTransactions;
    this.selectRow(null);
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
    });

    this.bankTransactions;
  }


  private transformBankTrxUploadResponse(responseBody: BankTrxReqResp): BankTrxReqRespPair[] | null {
    if (responseBody?.bankTransactions && responseBody.bankTransactions.length > 0) {
      const pairs = responseBody.bankTransactions.map(trx => {
        //BankTrxItemReqResp
        if (trx.processData?.transactions?.length === 1) {
          trx.singleTrxAccountId = trx.processData.transactions[0].accountId;
          trx.singleTrxTypeId = trx.processData.transactions[0].spendTypeId;
          trx.singleTrxIsPending = trx.processData.transactions[0].isPending;
        }
        else {
          trx.singleTrxAccountId = null;
          trx.singleTrxTypeId = 1;
          trx.singleTrxIsPending = false;
        }
        const copy = Utils.deepClone(trx);
        const matched = responseBody.accountsPerCurrencies.find(a => a.currencyId === trx.currency.id);
        if (!matched) {
          throw new Error("No accounts found");
        }

        const pair: BankTrxReqRespPair = new BankTrxReqRespPair();
        pair.original = copy;
        pair.current = trx;
        pair.accounts = matched.accounts;
        pair.resetRequested = false;

        if (!pair.current.processData?.transactions || pair.current.processData.transactions.length < 1) {
          if (!pair.current.processData?.transactions) {
            pair.current.processData = {
              transactions: []
            };
          }

          pair.current.processData.transactions.push(this.createBankTrxItemReqResp(trx));
        }
        if (pair.current.processData?.transactions) {
          pair.current.processData.transactions.forEach((pTrx) => {
            pTrx.accounts = matched.accounts;
          });
        }

        return pair;
      });

      return pairs;
    }

    return null;
  }

  private createBankTrxItemReqResp(bankTrxItemReqResp: BankTrxItemReqResp): BankTrxSpendViewModel {
    return {
      accountId: null,
      accounts: [],
      amountCurrencyId: bankTrxItemReqResp.currency.id,
      convertedAmount: bankTrxItemReqResp.fileTransaction.originalAmount,
      description: bankTrxItemReqResp.fileTransaction.description,
      originalAmount: bankTrxItemReqResp.fileTransaction.originalAmount,
      spendDate: bankTrxItemReqResp.fileTransaction.transactionDate,
      spendId: 1,
      spendTypeId: null,
      isPending: bankTrxItemReqResp.singleTrxIsPending ?? false,
      setPaymentDate: bankTrxItemReqResp.fileTransaction.transactionDate
    };
  }

  public sortBankTrxReqRespPairs = (a: BankTrxReqRespPair, b: BankTrxReqRespPair): number => {
    const aValue = this.statusOrder[a.original.dbStatus];
    const bValue = this.statusOrder[b.original.dbStatus];
    return aValue - bValue;
  };

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
      transactions: [],
      transactionDate: null
    }
  }

  private isAlreadyProcessed(item: BankTrxReqRespPair): boolean {
    return item.original.dbStatus === BankTransactionStatus.Processed && !item.resetRequested;
  }

  private isIgnoreRequested(item: BankTrxReqRespPair): boolean {
    return item.current.dbStatus === BankTransactionStatus.Ignored;
  }

  toggleAllPending(): void {
    const newValue = !this.allPending;
    this.allPending = newValue;
  }

  set ignoreSelected(value: boolean) {
    if (this.selectedTransaction) {
      this.selectedTransaction.current.dbStatus = value ? BankTransactionStatus.Ignored : BankTransactionStatus.Inserted;
    }
  }

  get ignoreSelected(): boolean {
    if (!this.selectedTransaction) {
      return false;
    }
    return this.selectedTransaction?.current.fileTransaction
      && this.selectedTransaction.current.dbStatus === BankTransactionStatus.Ignored;
  }

  get anyNew(): boolean {
    return this.bankTransactions.some(trx => trx.original.dbStatus === BankTransactionStatus.Inserted || trx.original.dbStatus === BankTransactionStatus.NotExisting);
  }

  get anyMarkableAsPending(): boolean {
    const acceptedStatus = [BankTransactionStatus.Inserted, BankTransactionStatus.NotExisting];
    return this.bankTransactions.some(trx => acceptedStatus.includes(trx.current.dbStatus) && !trx.isMultipleTrx);
  }

  set allPending(value: boolean) {
    const acceptedStatus = [BankTransactionStatus.Inserted, BankTransactionStatus.NotExisting];
    this.bankTransactions.forEach(trx => {
      if (acceptedStatus.includes(trx.current.dbStatus) && !trx.isMultipleTrx) {
        trx.current.singleTrxIsPending = value;
      }
    });
  }

  get allPending(): boolean {
    const acceptedStatus = [BankTransactionStatus.Inserted, BankTransactionStatus.NotExisting];
    const newTrxs = this.bankTransactions.filter(trx => acceptedStatus.includes(trx.current.dbStatus) && !trx.isMultipleTrx);
    return newTrxs?.length > 0 && newTrxs.every(trx => trx.current.singleTrxIsPending);
  }

}
