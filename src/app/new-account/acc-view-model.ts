import {
  BasicAccountIncluded,
  EditAccountViewModel,
  SelectableItem,
  SubAccountViewModel,
} from '../services/models';

export class AccountViewModel {
  accountName: string;
  selectedParentAcc?: BasicAccountIncluded;
  selectedCurrencyId: number | undefined;
  selectedFinancialEntityId: number | undefined;
  selectedAccountGroupId: number | undefined;
  selectedSpendTypeId: number | undefined;
  selectedPeriodTypeId: number | undefined;
  selectedAccountTypeId: number | undefined;
  editMode: boolean = false;
  selectedMethodIds: { [accountId: string]: SelectableItem | undefined } = {};
  defaultCurrencyId: number | null;
  isDefaultPending: boolean;
  subAccounts: SubAccountViewModel[] = [];

  public setValues(viewModel: EditAccountViewModel): void {
    this.selectedCurrencyId = viewModel.currencyViewModels.find(x => x.isSelected)?.id;
    this.selectedFinancialEntityId = viewModel.financialEntityViewModels.find(x => x.isSelected)?.id;
    this.selectedAccountGroupId = viewModel.accountGroupViewModels.find(x => x.isSelected)?.id;
    this.selectedSpendTypeId = viewModel.spendTypeViewModels.find(x => x.isSelected)?.id;
    this.selectedPeriodTypeId = viewModel.periodTypeViewModels.find(x => x.isSelected)?.id;
    this.selectedAccountTypeId = viewModel.accountTypeViewModels.find(x => x.isSelected)?.id;
    this.editMode = true;
    this.accountName = viewModel.accountName;
    this.subAccounts = viewModel.subAccounts ?? [];
    this.setAccountInclude(viewModel);
    this.defaultCurrencyId = viewModel.defaultCurrencyId;
    this.isDefaultPending = viewModel.isDefaultPending;
  }

  public get hasSubAccounts(): boolean {
    return this.subAccounts.length > 0;
  }

  private setAccountInclude(viewModel: EditAccountViewModel): void {
    const selected = viewModel.accountIncludeViewModels.find(x => x.isSelected);
    if (selected) {
      this.selectedParentAcc = selected;
      this.selectedMethodIds[selected.id.toString()] = selected.methodIds.find(
        (x) => x.isSelected
      );
    }
  }
}
