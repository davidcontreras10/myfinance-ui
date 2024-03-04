import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  AccountInclude,
  AddNewAccountViewModel,
  BasicAccountIncluded,
  NewAccountViewModel,
} from '../services/models';
import { AccountViewApiService } from '../services/account-view-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountViewModel } from './acc-view-model';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.css'],
})
export class NewAccountComponent implements OnInit {

  viewModel: AddNewAccountViewModel;
  inputModel: AccountViewModel = new AccountViewModel();

  constructor(
    private apiService: AccountViewApiService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const urlSegment =
      this.activatedRoute.snapshot.url.length > 1
        ? this.activatedRoute.snapshot.url[1]
        : null;
    if (urlSegment?.path === 'new') {
      console.log('Handling new account scenario');
      this.newAccountNgOnInit();
    } else if (urlSegment?.path === 'edit') {
      const paramAccountId = this.activatedRoute.snapshot.params['accountId'];
      const accountId = Number.parseInt(paramAccountId);
      if (accountId > 0) {
        console.log('Handling edit account scenario for accountId:', accountId);
        this.editAccountNgOnInit(accountId);
      } else {
        console.log('Invalid account Id');
        this.router.navigate(['/accounts']);
      }
    } else {
      console.log('Handling other scenarios');
      this.router.navigate(['/accounts']);
    }
  }

  onClose() {
    this.router.navigate(['/accounts']);
  }

  private editAccountNgOnInit(accountId: number) {
    this.apiService.getEditAccountViewModel(accountId).subscribe((res) => {
      console.log('Edit Model:', res);
      this.viewModel = res;
      this.inputModel.setValues(res);
    });
  }

  private newAccountNgOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      const queryAccountGroupId = params['accountGroupId'];
      if (queryAccountGroupId) {
        this.inputModel.selectedAccountGroupId =
          Number.parseInt(queryAccountGroupId);
      }
      this.apiService.getAddAccountViewModel().subscribe((res) => {
        console.log('New Model:', res);
        this.viewModel = res;
      });
    });
  }

  private readSubmitModel(form: NgForm): NewAccountViewModel | null {
    if (form.valid) {
      const formValue = form.value;
      const model = new NewAccountViewModel();
      model.accountGroupId = Number.parseInt(formValue.accountGroupId);
      model.baseBudget = formValue.baseBudget;
      model.accountName = formValue.accountName;
      model.headerColor = {
        headerColor: formValue.headerColor,
        borderColor: formValue.borderColor,
      };

      model.periodDefinitionId = Number.parseInt(formValue.periodType);
      model.currencyId = Number.parseInt(formValue.currencyId);
      model.financialEntityId = Number.parseInt(formValue.financialEntityId);
      model.accountTypeId = Number.parseInt(formValue.accountTypeId);
      model.spendTypeId = Number.parseInt(formValue.spendTypeId);
      model.accountIncludes = this.readAccountIncludes();

      return model;
    }
    return null;
  }

  private readAccountIncludes(): AccountInclude[] {
    const accArray: AccountInclude[] = [];
    if (this.inputModel.selectedMethodIds) {
      const methodsArray = this.inputModel.selectedMethodIds;
      for (let key in methodsArray) {
        if (methodsArray.hasOwnProperty(key)) {
          const method = methodsArray[key];
          if (method) {
            const accInclude = {
              accountId: 0,
              accountIncludeId: Number.parseInt(key),
              currencyConverterMethodId: method.id,
            };

            accArray.push(accInclude);
          }
        }
      }
    }

    return accArray;
  }

  private loadAccountIncludes() {
    this.inputModel.selectedMethodIds = {};
    this.viewModel.accountIncludeViewModels = [];
    this.inputModel.selectedParentAccs = [];
    if (
      this.inputModel.selectedCurrencyId &&
      this.inputModel.selectedCurrencyId > 0
    ) {
      this.apiService
        .getPossibleAccountInclude(
          this.inputModel.selectedCurrencyId,
          this.inputModel.selectedFinancialEntityId
        )
        .subscribe((res) => {
          this.viewModel.accountIncludeViewModels = res;
        });
    }
  }

  submit(form: NgForm) {
    const submitModel = this.readSubmitModel(form);
    if (submitModel) {
      this.apiService.addNewAccount(submitModel).subscribe(() => {
        alert('Account created');
        this.router.navigate(['/accounts']);
      });
    }
  }

  onCurrencyChanged() {
    this.loadAccountIncludes();
  }

  onFianancialEntityChanged() {
    this.loadAccountIncludes();
  }

  getIncludedAccounts(): BasicAccountIncluded[] {
    return this.viewModel?.accountIncludeViewModels.filter((vm) =>
      this.inputModel.selectedParentAccs.every((s) => s.id !== vm.id)
    );
  }

  accountIncludeClick(item: BasicAccountIncluded) {
    this.inputModel.selectedMethodIds[item.id] = item.methodIds.find(
      (x) => x.isSelected
    );
    this.inputModel.selectedParentAccs.push(item);
  }

  removeAccountInclude(item: BasicAccountIncluded) {
    const index = this.inputModel.selectedParentAccs.indexOf(item);
    if (index !== -1) {
      delete this.inputModel.selectedMethodIds[item.id.toString()];
      this.inputModel.selectedParentAccs.splice(index, 1);
    }
  }
}
