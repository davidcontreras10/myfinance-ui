export interface ApiCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface StoredToken {
  accessToken: string;
  expireDate: Date;
}

export interface FinanceAccountRequest {
  accountPeriodId: number;
  pendingSpends: boolean;
  loanSpends: boolean;
  amountTypeId: number;
}

export class SpendViewModel {
  accountId: number;
  spendId: number;
  spendDate: string;
  setPaymentDate: string;
  spendTypeId: number;
  spendTypeName: string;
  currencyName: string;
  currencySymbol: string;
  numerator: number;
  denominator: number;
  originalAmount: number;
  description: string;
  amountCurrencyId: number;
  amountTypeId: number;
  isPending: boolean;
  convertedAmount: number;
}

export interface FinanceAccountResponse {
  currencySymbol: string;
  budget: number;
  spent: number;
  periodBalance: number;
  generalBalance: number;
  generalBalanceToday: number;
  accountPeriodName: string;
  accountPeriodId: number;
  currencyId: number;
  initialDate: string;
  endDate: string;
  globalOrder: number;
  id: number;
  name: string;
  isSelected: boolean;
  accountId: number;
  accountName: string;
  spendViewModels: SpendViewModel[];
  numBudget: string;
  numSpent: string;
  numPeriodBalance: string;
  numGeneralBalance: string;
  numGeneralBalanceToday: string;
}

export interface SelectableItem {
  id: number;
  isDefault: boolean;
  name: string;
  isSelected: boolean;
}

export interface FinancialSummaryAccount {
  accountId: number;
  accountName: string;
  balance: {
    amount: number;
    currencySymbol: string;
  };

  financialEntityId?: number;
  financialEntityName: string;
}

export interface AddTrxResponse {
  userEndDate: Date;
  suggestedDate?: string;
  supportedCurrencies: SelectableItem[];
  spendTypeViewModels: SelectableItem[];
  accountPeriodId: number;
  currencyId: number;
  initialDate: Date;
  endDate: Date;
  accountName: string;
}

export interface AddTransferResponse extends AddTrxResponse {
  periodBalance: number;
  generalBalance: number;
  generalBalanceToday: number;
  currencySymbol: string;
}

export interface AddTrxRequest {
  accountPeriodId: number;
  amount: number;
  amountDenominator: number;
  amountNumerator: number;
  spendTypeId: number;
  currencyId: number;
  description: number;
  isPending: boolean;
  spendDate: Date;
  paymentDate: Date;
}

export interface AccountNotes {
  noteTitle: string;
  noteContent: string;
}

export interface Currency extends SelectableItem {
  symbol: string;
}

export interface ItemModifiedRes {
  accountId: number;
  isModified: boolean;
}

export interface BasicAccountIncluded extends SelectableItem {
  methodIds: SelectableItem[];
}

export interface TrxAccountIncluded extends BasicAccountIncluded {
  amount: {
    value: number;
    currencySymbol: string;
  };
}

export interface SlcTrxAccountIncluded extends TrxAccountIncluded {
  selectedMethod?: SelectableItem;
}

export interface TransactionViewResponse {
  spendInfo: {
    spendId: number;
    spendDate: Date;
    setPaymentDate?: Date;
    amountCurrencyId: number;
    convertedAmount: number;
    originalAmount: number;
    description: string;
    isPending: boolean;
    amountTypeId: number;
  };

  supportedCurrencies: Currency[];
  supportedAccountInclude: SlcTrxAccountIncluded[];
  spendTypeViewModels: SelectableItem[];
  accountName: string;
  amountTypeId: number;
}

export interface FileResponse {
  data: Blob;
  fileName: string;
}

export interface AccountStyle {
  headerColor: string;
  borderColor: string;
}

export interface AccountViewModel {
  accountId: number;
  accountName: string;
  accountPosition: number;
  currencyId: number;
  currencyName: string;
  frontStyle: AccountStyle;
  type: number;
}

export interface AccGroupViewModel {
  accountGroupId: number;
  accountGroupName: string;
  accountGroupPosition: number;
  accountGroupDisplayValue: number;
  isSelected: boolean;
}

export interface AccountViewApiModel {
  accountDetailsViewModels: AccountViewModel[];
  accountGroupViewModels: AccGroupViewModel[];
}

export interface AccountGroupRequest {
  accountGroupName: string;
  accountGroupPosition: number;
  accountGroupDisplayValue: string;
  displayDefault: boolean;
}

export interface AddNewAccountViewModel {
  accountStyle?: AccountStyle;
  baseBudget: number;
  accountName: string;
  spendTypeViewModels: SelectableItem[];
  accountTypeViewModels: SelectableItem[];
  periodTypeViewModels: SelectableItem[];
  financialEntityViewModels: SelectableItem[];
  accountIncludeViewModels: BasicAccountIncluded[];
  currencyViewModels: Currency[];
  accountGroupViewModels: SelectableItem[];
}

export interface EditAccountViewModel extends AddNewAccountViewModel {
  accountGroupId: number;
  accountId: number;
  accountPosition: number;
}

export interface AccountInclude {
  accountId: number;
  accountIncludeId: number;
  currencyConverterMethodId: number;
}

export class NewAccountViewModel {
  baseBudget: number;
  accountName: string;
  headerColor: AccountStyle;
  periodDefinitionId: number;
  currencyId: number;
  accountTypeId: number;
  spendTypeId: number;
  financialEntityId: number;
  accountGroupId: number;
  accountIncludes: AccountInclude[];
}
