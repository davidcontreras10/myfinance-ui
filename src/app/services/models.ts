
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

export interface PendingTrxFilter {
  value: boolean;
}

export interface DescriptionTrxFilter {
  searchText: string | null;
}

export interface TrxFilters {
  startDate: Date | null;
  endDate: Date | null;
  pendingTrxFilter: PendingTrxFilter | null;
  descriptionTrxFilter: DescriptionTrxFilter | null
}

export class BasicTrxFilters implements TrxFilters {
  startDate: Date | null;
  endDate: Date | null;
  pendingTrxFilter: PendingTrxFilter | null;
  descriptionTrxFilter: DescriptionTrxFilter | null;
}

export interface FinanceAccountRequest {
  accountPeriodId: number;
  pendingSpends: boolean;
  loanSpends: boolean;
  amountTypeId: number;
  trxFilters: TrxFilters | null
}

export class BankTrxSpendViewModel {
  accountId: number | null;
  spendId: number;
  spendDate: Date;
  setPaymentDate: Date | null;
  spendTypeId: number | null;
  originalAmount: number | null;
  amountCurrencyId: number;
  description: string;
  convertedAmount: number;
  accounts: SelectableItem[];
  isPending: boolean;
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
  vmIsSelected: boolean = false;
  hasBankTrx: boolean | null = null;
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
  trxFilters: TrxFilters | null;
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
  isDefaultPending: boolean | undefined;
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

export interface GetFinanceReq {
  accountPeriodId: number;
  trxFilters: TrxFilters | null | undefined;
}

export interface GetFinanceApiReq extends GetFinanceReq {
  amountTypeId: number;
  loanSpends: boolean;
  pendingSpends: boolean;
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
    hasBankTrx: boolean;
  };

  supportedCurrencies: Currency[];
  supportedAccountInclude: SlcTrxAccountIncluded[];
  spendTypeViewModels: SelectableItem[];
  accountName: string;
  amountTypeId: number;
  transferInfo: {
    sourceAccountName: string,
    destinationAccountName: string,
  } | null;
}

export interface FileResponse {
  data: Blob;
  fileName: string;
}

export interface AccountStyle {
  headerColor: string;
  borderColor: string;
}

export interface AccountBasicInfo {
  accountId: number;
  accountName: string;
}

export interface AccountViewModel extends AccountBasicInfo {
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
  defaultCurrencyId: number | null;
  isDefaultPending: boolean;
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

export class NewAccountRequestModel {
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
  defaultCurrencyId: number | null;
  isDefaultPending: boolean;
}

export class EditAccountRequestModel {
  constructor(public accountId: number) {

  }

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
  editAccountFields: number[] = [];
  defaultCurrencyId: number | null;
  isDefaultPending: boolean;
}

export interface TrxTypeViewModel extends SelectableItem {
  description: string;
}

export interface NewTrxTypeRequest {
  isSelected: boolean;
  spendTypeName: string;
  spendTypeDescription: string;
}

export interface EditTrxTypeRequest extends NewTrxTypeRequest {
  spendTypeId: number;
}

export interface DialogResultModel<T> {
  value: T;
  success: boolean;
}

export class FileBankTransaction {
  transactionId: string;
  originalAmount: number;
  transactionDate: Date;
  description: string;
  currencyCode: string;
}

export enum BankTransactionStatus {
  Unknown = 0,
  Processed = 1,
  Ignored = 2,
  NotExisting = 3,
  Inserted = 4
}

export interface AccountWithTrxTypeId extends SelectableItem {
  trxTypeId: number | null;
}

export interface AccountsByCurrencyViewModel {
  currencyId: number;
  accounts: AccountWithTrxTypeId[];
}

export interface BankTrxReqResp {
  accountsPerCurrencies: AccountsByCurrencyViewModel[];
  bankTransactions: BankTrxItemReqResp[];
}

export interface BankTrxItemReqResp {
  financialEntityId: number;
  fileTransaction: FileBankTransaction;
  dbStatus: BankTransactionStatus;
  currency: Currency;
  singleTrxAccountId: number | null;
  singleTrxTypeId: number | null;
  singleTrxIsPending: boolean | null;
  processData: {
    transactions: BankTrxSpendViewModel[]
  };
}

export interface ClientBankTrxRequest {
  amount: number;
  isPending: boolean;
  spendTypeId: number;
  accountId: number;
  description: string;
}

export interface ClientBankItemRequest {
  transactionId: string;
  financialEntityId: number;
  requestIgnore: boolean;
  description: string | null;
  isMultipleTrx: boolean | null;
  accountId: number | null;
  spendTypeId: number | null;
  isPending: boolean | null;
  transactions: ClientBankTrxRequest[] | null;
  transactionDate: Date | null;
}

export interface BankTrxProcessResponse {
  bankTransactions: BankTrxItemReqResp[];
  itemModifieds: ItemModifiedRes[];
}

export interface AppUser {
  userId: string;
  username: string;
  name: string;
  primaryEmail: string;
}

export interface DebtMngrUser extends AppUser {
  status: number;
}

export const DebtorRequestStatus = {
  Undefined: 0,
  Pending: 1,
  Paid: 2,
  Rejected: 3
} as const;

export const CreditorRequestStatus = {
  Undefined: 0,
  Pending: 1,
  Paid: 2,
  Archived: 3
} as const;

export interface DebtRequestVm {
  id: number;
  eventName: string;
  eventDescription: string;
  eventDate: Date;
  createdDate: Date;
  amount: number;
  currency: Currency;
  creditor: DebtMngrUser;
  debtor: DebtMngrUser;
  createdByMe: boolean;
  isSelected: boolean;
}

export interface AddDebtRequestVm {
  supportedCurrencies: Currency[];
  supportedUsers: AppUser[];
}

export interface NewDebtRequest {
  targetUserId: string;
  amount: number;
  currencyId: number;
  eventDate: Date;
  eventName: string;
  eventDescription: string;
}