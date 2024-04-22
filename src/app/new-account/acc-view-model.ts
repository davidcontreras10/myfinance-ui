import {
  BasicAccountIncluded,
  EditAccountViewModel,
  SelectableItem,
} from '../services/models';

export class AccountViewModel {
  amount: number = 0;
  accountName: string;
  selectedParentAccs: BasicAccountIncluded[] = [];
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

  public setValues(viewModel: EditAccountViewModel): void {
    this.amount = viewModel.baseBudget;
    this.selectedCurrencyId = viewModel.currencyViewModels.find(x => x.isSelected)?.id;
    this.selectedFinancialEntityId = viewModel.financialEntityViewModels.find(x => x.isSelected)?.id;
    this.selectedAccountGroupId = viewModel.accountGroupViewModels.find(x => x.isSelected)?.id;
    this.selectedSpendTypeId = viewModel.spendTypeViewModels.find(x => x.isSelected)?.id;
    this.selectedPeriodTypeId = viewModel.periodTypeViewModels.find(x => x.isSelected)?.id;
    this.selectedAccountTypeId = viewModel.accountTypeViewModels.find(x => x.isSelected)?.id;
    this.editMode = true;
    this.accountName = viewModel.accountName;
    this.setAccountIncludes(viewModel);
    this.defaultCurrencyId = viewModel.defaultCurrencyId;
    this.isDefaultPending = viewModel.isDefaultPending;
  }

  private setAccountIncludes(viewModel: EditAccountViewModel): void {
    viewModel.accountIncludeViewModels.filter(x => x.isSelected).forEach((basicAccountIncluded: BasicAccountIncluded) => {
      this.selectedParentAccs.push(basicAccountIncluded);
      this.selectedMethodIds[basicAccountIncluded.id.toString()] = basicAccountIncluded.methodIds.find(
        (x) => x.isSelected
      );
    })
  }
}
