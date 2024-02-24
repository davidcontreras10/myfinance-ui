import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AddNewAccountModels, BasicAccountIncluded } from '../services/models';
import { AccountViewApiService } from '../services/account-view-api.service';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.css'],
})
export class NewAccountComponent implements OnInit {
  viewModel: AddNewAccountModels;
  selectedParentAccs: BasicAccountIncluded[] = [];
  selectedCurrencyId: number | undefined;
  selectedFinancialEntityId: number | undefined;

  constructor(private apiService: AccountViewApiService) {}

  ngOnInit(): void {
    this.apiService.getAddAccountViewModel().subscribe((res) => {
      this.viewModel = res;
    });
  }

  private loadAccountIncludes() {
    this.viewModel.accountIncludeViewModels = [];
    this.selectedParentAccs = [];
    if (this.selectedCurrencyId && this.selectedCurrencyId > 0) {
      this.apiService
        .getPossibleAccountInclude(
          this.selectedCurrencyId,
          this.selectedFinancialEntityId
        )
        .subscribe((res) => {
          this.viewModel.accountIncludeViewModels = res;
        });
    }
  }

  submit(_t5: NgForm) {
    throw new Error('Method not implemented.');
  }

  onCurrencyChanged() {
    this.loadAccountIncludes();
  }

  onFianancialEntityChanged() {
    this.loadAccountIncludes();
  }

  getIncludedAccounts(): BasicAccountIncluded[] {
    return this.viewModel?.accountIncludeViewModels.filter((vm) =>
      this.selectedParentAccs.every((s) => s.id !== vm.id)
    );
  }

  accountIncludeClick(item: BasicAccountIncluded) {
    this.selectedParentAccs.push(item);
  }

  removeAccountInclude(item: BasicAccountIncluded) {
    const index = this.selectedParentAccs.indexOf(item);
    if (index !== -1) {
      this.selectedParentAccs.splice(index, 1);
    }
  }
}
