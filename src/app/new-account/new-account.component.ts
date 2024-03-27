import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  AccountInclude,
  AddNewAccountViewModel,
  BasicAccountIncluded,
  EditAccountRequestModel,
  EditAccountViewModel,
  NewAccountRequestModel,
} from '../services/models';
import { AccountViewApiService } from '../services/account-view-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountViewModel } from './acc-view-model';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.css'],
})
export class NewAccountComponent implements OnInit {

  viewModel: AddNewAccountViewModel;
  inputModel: AccountViewModel = new AccountViewModel();
  accountFiedlds: { [fieldId: string]: number } = {
    'accountName': 1,
    'baseBudget': 4,
    'headerColor': 5,
    'accountTypeId': 6,
    'spendTypeId': 7,
    'financialEntityId': 8,
    'accountIncludes': 9,
    'accountGroupId': 10
  }

  constructor(
    private apiService: AccountViewApiService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private navigation: NavigationService
  ) { }

  ngOnInit(): void {
    const urlSegment =
      this.activatedRoute.snapshot.url.length > 1
        ? this.activatedRoute.snapshot.url[1]
        : null;
    if (urlSegment?.path === 'new') {
      this.newAccountNgOnInit();
    } else if (urlSegment?.path === 'edit') {
      const paramAccountId = this.activatedRoute.snapshot.params['accountId'];
      const accountId = Number.parseInt(paramAccountId);
      if (accountId > 0) {
        this.editAccountNgOnInit(accountId);
      } else {
        console.log('Invalid account Id');
        this.navigation.goBack(['/accounts']);
      }
    } else {
      console.log('Handling other scenarios');
      this.navigation.goBack(['/accounts']);
    }
  }

  onClose() {
    this.navigation.goBack(['/accounts']);
  }

  private editAccountNgOnInit(accountId: number) {
    this.apiService.getEditAccountViewModel(accountId).subscribe((res) => {
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
        this.viewModel = res;
      });
    });
  }

  private readEditSubmitModel(form: NgForm): EditAccountRequestModel | null {
    const viewModel = this.getIfEditModel();
    if (viewModel) {
      const controls = form.controls;
      console.log('Edit Form:', form);
      const requestModel = new EditAccountRequestModel(viewModel.accountId);
      if (controls['accountName'].dirty) {
        requestModel.accountName = this.inputModel.accountName;
        requestModel.editAccountFields.push(this.accountFiedlds['accountName']);
      }

      if (controls['baseBudget'].dirty) {
        requestModel.baseBudget = this.inputModel.amount;
        requestModel.editAccountFields.push(this.accountFiedlds['baseBudget']);
      }

      if (controls['accountTypeId'].dirty) {
        requestModel.accountTypeId = this.inputModel.selectedAccountTypeId ?? 0;
        requestModel.editAccountFields.push(this.accountFiedlds['accountTypeId']);
      }

      if (controls['financialEntityId'].dirty) {
        requestModel.financialEntityId = this.inputModel.selectedFinancialEntityId ?? 0;
        requestModel.editAccountFields.push(this.accountFiedlds['financialEntityId']);
      }

      if (controls['spendTypeId'].dirty) {
        requestModel.spendTypeId = this.inputModel.selectedSpendTypeId ?? 0;
        requestModel.editAccountFields.push(this.accountFiedlds['spendTypeId']);
      }

      if (controls['accountGroupId'].dirty) {
        requestModel.accountGroupId = this.inputModel.selectedAccountGroupId ?? 0;
        requestModel.editAccountFields.push(this.accountFiedlds['accountGroupId']);
      }

      if (this.isAccountIncludeModified()) {
        requestModel.editAccountFields.push(this.accountFiedlds['accountIncludes']);
        requestModel.accountIncludes = this.readAccountIncludes(viewModel.accountId);
      }

      if (controls['headerColor'].dirty || controls['borderColor'].dirty) {
        requestModel.headerColor = {
          headerColor: form.value.headerColor,
          borderColor: form.value.borderColor,
        };
        requestModel.editAccountFields.push(this.accountFiedlds['headerColor']);
      }

      return requestModel;
    }
    return null;
  }

  private isAccountIncludeModified(): boolean {
    const selectedAccountIncludes = this.viewModel.accountIncludeViewModels.filter(x => x.isSelected);
    const acciCount = Object.keys(this.inputModel.selectedMethodIds).length;
    if (acciCount !== selectedAccountIncludes.length) {
      return true;
    }
    for (let acci of selectedAccountIncludes) {
      const inputAcciMethod = this.inputModel.selectedMethodIds[acci.id.toString()];
      if (inputAcciMethod) {
        const vmSelectedMethod = acci.methodIds.find(m => m.isSelected);
        if (vmSelectedMethod) {
          if (vmSelectedMethod.id != inputAcciMethod.id) {
            return true;
          }
        }
        else {
          return true;
        }
      }
      else {
        return true;
      }
    }

    return false;
  }

  private readNewSubmitModel(form: NgForm): NewAccountRequestModel | null {
    if (form.valid) {
      const formValue = form.value;
      const model = new NewAccountRequestModel();
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

  private readAccountIncludes(accountId: number = 0): AccountInclude[] {
    const accArray: AccountInclude[] = [];
    if (this.inputModel.selectedMethodIds) {
      const methodsArray = this.inputModel.selectedMethodIds;
      for (let key in methodsArray) {
        if (methodsArray.hasOwnProperty(key)) {
          const method = methodsArray[key];
          if (method) {
            const accInclude = {
              accountId: accountId,
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

  private loadAccountIncludes(preserveAccSelection: boolean = false) {
    this.inputModel.selectedMethodIds = {};
    this.viewModel.accountIncludeViewModels = [];
    let tempSelectedParentAccs: number[] = [];
    if (preserveAccSelection) {
      tempSelectedParentAccs = this.inputModel.selectedParentAccs.map(x => x.id);
    }
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
          if (preserveAccSelection) {
            for (let accId of tempSelectedParentAccs) {
              const acc = this.viewModel.accountIncludeViewModels.find(acci => acci.id === accId);
              if (acc)
                this.accountIncludeClick(acc);
            }
          }
        });
    }
  }

  private submitEditAccount(form: NgForm) {
    const requestModel = this.readEditSubmitModel(form);
    console.log('Request Model:', requestModel);
    if (requestModel) {
      this.apiService.editAccount(requestModel).subscribe(() => {
        alert('Account edited');
        this.navigation.goBack(['/accounts']);
      });
    }
  }

  private submitNewAccount(form: NgForm): void {
    const submitModel = this.readNewSubmitModel(form);
    if (submitModel) {
      this.apiService.addNewAccount(submitModel).subscribe(() => {
        alert('Account created');
        this.navigation.goBack(['/accounts']);
      });
    }
  }

  private getIfEditModel(): EditAccountViewModel | null {
    // Check if the object has the necessary properties to match MyInterface
    if ('accountId' in this.viewModel) {
      // Type assertion: Assert that obj matches MyInterface
      return this.viewModel as EditAccountViewModel;
    } else {
      return null;
    }
  }

  submit(form: NgForm) {
    if (!this.inputModel.editMode) {
      this.submitNewAccount(form);
    }
    else {
      this.submitEditAccount(form);
    }
  }

  onCurrencyChanged() {
    this.loadAccountIncludes();
  }

  onFianancialEntityChanged() {
    this.loadAccountIncludes(true);
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
