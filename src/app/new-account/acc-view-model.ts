import { BasicAccountIncluded, SelectableItem } from '../services/models';

export class AccountViewModel {
  amount: number = 0;
  selectedParentAccs: BasicAccountIncluded[] = [];
  selectedCurrencyId: number | undefined;
  selectedFinancialEntityId: number | undefined;
  selectedAccountGroup: number | undefined;
  selectedSpendTypeId: number | undefined;
  editMode: boolean = false;
  selectedMethodIds: { [key: string]: SelectableItem | undefined } = {};
}
