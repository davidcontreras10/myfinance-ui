import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BalanceTypes } from '../models';
import { MainViewModel } from '../main-view-model';
import { MainViewApiService } from 'src/app/services/main-view-api.service';
import { AddTransferResponse, SelectableItem } from 'src/app/services/models';
import { Utils } from 'src/app/utils';

@Component({
  selector: 'app-transfer-view',
  templateUrl: './transfer-view.component.html',
  styleUrls: ['./transfer-view.component.css']
})
export class TransferViewComponent implements OnInit {

  public BalanceTypes = BalanceTypes;

  @Input() accountPeriodId: number;
  viewModel?: AddTransferResponse;
  destinationAccounts?: SelectableItem[];

  selectedCurrencyId?: number;
  selectedSpendTypeId?: number;
  selectedAmountTypeId?: BalanceTypes;

  constructor(public activeModal: NgbActiveModal, private mainViewModel: MainViewModel, private mainViewApiService: MainViewApiService) { }

  ngOnInit(): void {
    if (this.accountPeriodId) {
      this.mainViewApiService.getTransferInfo(this.accountPeriodId).subscribe(res => {
        this.viewModel = res;
        this.viewModel.suggestedDate = this.fixSuggestedDate(this.viewModel.suggestedDate);
        this.selectedCurrencyId = this.viewModel.supportedCurrencies.find(c => c.isSelected)?.id;
        this.selectedSpendTypeId = this.viewModel.spendTypeViewModels.find(st => st.isSelected)?.id;
      });
    }
  }

  onAmountTypeChanged() {
    this.loadCurrentDestinationAccounts();
  }

  onCurrencyChanged() {
    this.loadCurrentDestinationAccounts();
  }

  loadCurrentDestinationAccounts() {
    if (this.selectedAmountTypeId && this.accountPeriodId) {
      if ((this.selectedAmountTypeId === BalanceTypes.Custom && this.selectedCurrencyId) || this.selectedAmountTypeId != BalanceTypes.Custom) {
        this.mainViewApiService.getPossibleTransferDestAccounts(this.accountPeriodId, this.selectedAmountTypeId, this.selectedCurrencyId).subscribe(accounts => {
          this.destinationAccounts = accounts;
        })
      }
    }
  }

  submit(f: any) {
    if (f.valid) {
      this.fixSubmitModel(f.value);
      this.mainViewApiService.submitTransfer(f.value).subscribe(items => {
        this.activeModal.close('Submit');
        this.mainViewModel.notifyAccountsModified(items);
      })
    }
  }

  private fixSubmitModel(model: any) {
    model.accountPeriodId = this.accountPeriodId;
    if (!model.isPending) {
      model.isPending = false;
    }

    if (!model.amount) {
      model.amount = 0;
    }

    if (!model.spendDate) {
      model.spendDate = this.viewModel?.suggestedDate;
    }
  }

  private fixSuggestedDate(dirtyDate?: string): string | undefined {
    if (dirtyDate) {
      const suggestedDate = new Date(dirtyDate);
      return Utils.toViewDateFormat(suggestedDate);
    }

    return undefined;
  }

}
