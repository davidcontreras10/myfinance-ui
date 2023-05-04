import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MainViewApiService } from 'src/app/services/main-view-api.service';
import { AddTrxRequest, AddTrxResponse } from 'src/app/services/models';
import { MainViewModel } from '../main-view-model';

@Component({
  selector: 'app-add-trx',
  templateUrl: './add-trx.component.html',
  styleUrls: ['./add-trx.component.css']
})
export class AddTrxComponent implements OnInit {

  @Input() isSpending: boolean;
  @Input() accountPeriodId: number;
  @ViewChild('f') form: any;
  addTrxModel?: AddTrxResponse;
  selectedCurrencyId?: number;
  selectedSpendingTypeId?: number;

  constructor(public activeModal: NgbActiveModal, private mainViewApiSerice: MainViewApiService, private mainViewModel: MainViewModel) { }

  ngOnInit(): void {
    this.loadAddTrxData();
  }

  public submit(submitValue: any) {
    if (submitValue.form.valid) {
      const submittedValue = this.fixFormSubmittedValues(submitValue.value);
      console.log('Form Value:', JSON.stringify(submittedValue));
      this.mainViewApiSerice.addBasicTrx(submittedValue, this.isSpending).subscribe({
        next: res => {
          alert(`${res.length} account/s updated`);
          this.mainViewModel.notifyAccountsModified(res);
          this.activeModal.close('Submit');
        },
        error: err => console.error('Add trx error:', err)
      })
    }
  }

  private fixFormSubmittedValues(formValue: any): AddTrxRequest {
    if (!formValue.spendDate) {
      formValue.spendDate = this.addTrxModel?.suggestedDate;
    }

    formValue.isPending = !!formValue.isPending;
    formValue.paymentDate = formValue.spendDate;
    formValue.accountPeriodId = this.accountPeriodId;
    formValue.amountDenominator = 1;
    formValue.amountNumerator = 1;
    return formValue as AddTrxRequest;
  }

  private fixSuggestedDate(dirtyDate?: string): string | undefined {
    if (dirtyDate) {
      const suggestedDate = new Date(dirtyDate);
      return this.toViewDateFormat(suggestedDate);
    }

    return undefined;
  }

  private loadAddTrxData() {
    if (this.accountPeriodId) {
      this.mainViewApiSerice.loadAddTrxData(this.accountPeriodId).subscribe(res => {
        console.log('loadAddTrxData', res);
        if (res) {
          res.suggestedDate = this.fixSuggestedDate(res.suggestedDate);
        }
        this.addTrxModel = res;
        this.assignDefaultSupportedCurrency();
        this.assignDefaultSpendingType();
      });
    }
  }

  private assignDefaultSupportedCurrency() {
    if (this.addTrxModel?.supportedCurrencies && this.addTrxModel?.supportedCurrencies.length > 0) {
      this.selectedCurrencyId = this.addTrxModel?.supportedCurrencies.find(c => c.isSelected)?.id;
      if (!this.selectedCurrencyId) {
        this.selectedCurrencyId = this.addTrxModel?.supportedCurrencies[0]?.id
      }
    }
  }

  private assignDefaultSpendingType() {
    if (this.addTrxModel?.spendTypeViewModels && this.addTrxModel?.spendTypeViewModels.length > 0) {
      this.selectedSpendingTypeId = this.addTrxModel?.spendTypeViewModels.find(c => c.isSelected)?.id;
      if (!this.selectedSpendingTypeId) {
        this.selectedSpendingTypeId = this.addTrxModel?.spendTypeViewModels[0]?.id
      }
    }
  }

  private toViewDateFormat(date: Date) {
    const year = date.getFullYear().toString().padStart(4, '0'); // get the year and pad with leading zeros
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // get the month and pad with leading zeros
    const day = date.getDate().toString().padStart(2, '0'); // get the day and pad with leading zeros
    const hours = date.getHours().toString().padStart(2, '0'); // get the hours and pad with leading zeros
    const minutes = date.getMinutes().toString().padStart(2, '0'); // get the minutes and pad with leading zeros
    return `${year}-${month}-${day}T${hours}:${minutes}`; // concatenate the values into a string with the desired format
  }
}
