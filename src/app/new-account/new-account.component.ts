import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  AccountInclude,
  AddNewAccountViewModel,
  BasicAccountIncluded,
  EditAccountRequestModel,
  EditAccountViewModel,
  NewAccountRequestModel,
  SelectableItem,
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
  pendingParentAccountId?: number;
  addChildParentName?: string;
  financialEntityLocked = false;
  financialEntityLockedBy?: string;
  accountIncludesLoaded = false;
  accountFiedlds: { [fieldId: string]: number } = {
    'accountName': 1,
    'baseBudget': 4,
    'headerColor': 5,
    'accountTypeId': 6,
    'spendTypeId': 7,
    'financialEntityId': 8,
    'accountIncludes': 9,
    'accountGroupId': 10,
    'defaultCurrencyId': 11,
    'isDefaultPending': 12
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
      const queryParentAccountId = params['parentAccountId'];
      if (queryParentAccountId) {
        this.pendingParentAccountId = Number.parseInt(queryParentAccountId);
        this.addChildParentName = params['parentAccountName'];
      }
      this.apiService.getAddAccountViewModel().subscribe((res) => {
        this.viewModel = res;
        if (this.pendingParentAccountId) {
          this.prefillFinancialEntityFromParent(this.pendingParentAccountId);
        }
      });
    });
  }

  private prefillFinancialEntityFromParent(parentAccountId: number) {
    this.apiService.getEditAccountViewModel(parentAccountId).subscribe((parent) => {
      const entityId = parent?.financialEntityViewModels.find((e) => e.isSelected)?.id;
      if (
        entityId &&
        !this.inputModel.selectedFinancialEntityId &&
        this.viewModel.financialEntityViewModels.some((e) => e.id === entityId)
      ) {
        this.inputModel.selectedFinancialEntityId = entityId;
        this.financialEntityLocked = true;
        this.financialEntityLockedBy = this.addChildParentName;
      }
    });
  }

  /**
   * A new sub-account must have the same financial entity as its main account (when that has one).
   * Only applies when creating: existing accounts aren't re-checked on edit.
   */
  private applyFinancialEntityRule(parent: BasicAccountIncluded | undefined) {
    if (this.inputModel.editMode) {
      return;
    }

    const requiredEntityId = parent?.requiredFinancialEntityId;
    if (requiredEntityId) {
      this.inputModel.selectedFinancialEntityId = requiredEntityId;
      this.financialEntityLocked = true;
      this.financialEntityLockedBy = parent?.name;
    } else if (parent || !this.isParentLocked()) {
      this.financialEntityLocked = false;
    }
  }

  /** Why the chosen main account can't be saved, or null when it can. */
  parentIssue(): string | null {
    const parent = this.inputModel.selectedParentAcc;
    if (parent) {
      // When the user must choose, the required exchange-method select already blocks saving.
      return this.inputModel.selectedMethodIds[parent.id] || parent.requiresMethodChoice
        ? null
        : `There is no exchange method between this account's currency and ${parent.name}'s.`;
    }

    if (!this.inputModel.editMode && this.isParentLocked() && this.accountIncludesLoaded) {
      return `${this.addChildParentName} can't be the main account of this account: there is no exchange method between their currencies.`;
    }

    return null;
  }

  onMethodSelected(method: SelectableItem | undefined) {
    const parent = this.inputModel.selectedParentAcc;
    if (parent) {
      this.inputModel.selectedMethodIds[parent.id] = method;
    }
  }

  isParentLocked(): boolean {
    return !!this.pendingParentAccountId;
  }

  private tryApplyPendingParent() {
    if (this.pendingParentAccountId) {
      const candidate = this.getAvailableParentAccounts().find(
        (a) => a.id === this.pendingParentAccountId
      );
      if (candidate && candidate.methodIds.length > 0) {
        this.onParentAccountChanged(candidate);
      }
    }
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

      if (controls['defaultCurrencyId'].dirty) {
        requestModel.defaultCurrencyId = this.inputModel.defaultCurrencyId;
        requestModel.editAccountFields.push(this.accountFiedlds['defaultCurrencyId']);
      }

      if (controls['isDefaultPending'].dirty) {
        requestModel.isDefaultPending = this.inputModel.isDefaultPending;
        requestModel.editAccountFields.push(this.accountFiedlds['isDefaultPending']);
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
    const previouslySelected = this.viewModel.accountIncludeViewModels.find(x => x.isSelected);
    const currentlySelected = this.inputModel.selectedParentAcc;
    if (previouslySelected?.id !== currentlySelected?.id) {
      return true;
    }
    if (currentlySelected) {
      const inputMethod = this.inputModel.selectedMethodIds[currentlySelected.id.toString()];
      const vmSelectedMethod = previouslySelected?.methodIds.find(m => m.isSelected);
      return vmSelectedMethod?.id !== inputMethod?.id;
    }

    return false;
  }

  private readNewSubmitModel(form: NgForm): NewAccountRequestModel | null {
    if (form.valid) {
      const formValue = form.value;
      const model = new NewAccountRequestModel();
      model.accountGroupId = Number.parseInt(formValue.accountGroupId);
      model.baseBudget = 0; // the base budget is no longer entered in the form
      model.accountName = formValue.accountName;
      model.headerColor = {
        headerColor: formValue.headerColor,
        borderColor: formValue.borderColor,
      };

      model.periodDefinitionId = Number.parseInt(formValue.periodType);
      model.currencyId = Number.parseInt(formValue.currencyId);
      model.financialEntityId = this.financialEntityLocked
        ? this.inputModel.selectedFinancialEntityId ?? 0
        : Number.parseInt(formValue.financialEntityId);
      model.accountTypeId = Number.parseInt(formValue.accountTypeId);
      model.spendTypeId = Number.parseInt(formValue.spendTypeId);
      model.defaultCurrencyId = this.toValidId(formValue.defaultCurrencyId);
      model.isDefaultPending = !!formValue.isDefaultPending;
      model.accountIncludes = this.readAccountIncludes();

      return model;
    }
    return null;
  }

  private toValidId(value: any): number | null {
    const parsedValue = Number(value);

    if (isNaN(parsedValue) || parsedValue <= 0) {
      return null;
    }

    return parsedValue;
  }

  private readAccountIncludes(accountId: number = 0): AccountInclude[] {
    const selected = this.inputModel.selectedParentAcc;
    if (!selected) {
      return [];
    }

    const method = this.inputModel.selectedMethodIds[selected.id.toString()];
    if (!method) {
      return [];
    }

    return [{
      accountId: accountId,
      accountIncludeId: selected.id,
      currencyConverterMethodId: method.id,
    }];
  }

  private loadAccountIncludes(preserveAccSelection: boolean = false) {
    const previousSelectionId = preserveAccSelection ? this.inputModel.selectedParentAcc?.id : undefined;
    this.inputModel.selectedMethodIds = {};
    this.viewModel.accountIncludeViewModels = [];
    this.inputModel.selectedParentAcc = undefined;
    this.accountIncludesLoaded = false;
    this.applyFinancialEntityRule(undefined);
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
          this.accountIncludesLoaded = true;
          if (previousSelectionId) {
            const acc = res.find(acci => acci.id === previousSelectionId);
            if (acc && acc.methodIds.length > 0) {
              this.onParentAccountChanged(acc);
            }
          } else {
            this.tryApplyPendingParent();
          }
        });
    }
  }

  private submitEditAccount(form: NgForm) {
    const requestModel = this.readEditSubmitModel(form);
    console.log('Request Model:', requestModel);
    if (requestModel) {
      this.apiService.editAccount(requestModel).subscribe({
        next: () => {
          alert('Account edited');
          this.navigation.goBack(['/accounts']);
        },
        error: (err) => this.showSubmitError(err),
      });
    }
  }

  private submitNewAccount(form: NgForm): void {
    const submitModel = this.readNewSubmitModel(form);
    if (submitModel) {
      this.apiService.addNewAccount(submitModel).subscribe({
        next: () => {
          alert('Account created');
          this.navigation.goBack(['/accounts']);
        },
        error: (err) => this.showSubmitError(err),
      });
    }
  }

  private showSubmitError(err: any): void {
    console.error(err);
    alert(err?.error?.message ?? 'Error saving account');
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

  getSubAccountNamesPreview(): string {
    const names = this.inputModel.subAccounts.slice(0, 3).map((s) => s.accountName);
    const suffix = this.inputModel.subAccounts.length > 3 ? ', …' : '';
    return names.join(', ') + suffix;
  }

  getAvailableParentAccounts(): BasicAccountIncluded[] {
    return this.viewModel?.accountIncludeViewModels.filter((vm) => !vm.hasParent) ?? [];
  }

  onParentAccountChanged(item: BasicAccountIncluded | undefined) {
    this.inputModel.selectedMethodIds = {};
    this.inputModel.selectedParentAcc = item;
    if (item) {
      // Already selected by the server when it's determined; left empty when the user has to choose.
      this.inputModel.selectedMethodIds[item.id] = item.methodIds.find(
        (x) => x.isSelected
      );
    }

    this.applyFinancialEntityRule(item);
  }

  onParentAccountSelect(accountId: string) {
    const parsedId = Number.parseInt(accountId, 10);
    const item = this.getAvailableParentAccounts().find((a) => a.id === parsedId);
    this.onParentAccountChanged(item);
  }
}
