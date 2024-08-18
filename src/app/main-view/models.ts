import { AccountWithTrxTypeId, BankTransactionStatus, BankTrxItemReqResp, Currency, FinanceAccountResponse, FinancialSummaryAccount, SelectableItem, SlcTrxAccountIncluded, TrxFilters } from "../services/models";

export interface MainViewPrefs {
    periodsLimit: number;
}

export interface AccountGroup {
    id: number;
    name: string;
    accounts: AccountGroupAccount[],
    isSelected: boolean,
    accountGroupPosition: number
}

export class AccountGroupAccount {
    accountId: number;
    accountName: string;
    position: number;
    currentPeriodId: number;
    currencyName: string;
    frontStyle: {
        headerColor: string;
        borderColor: string;
    };
    type: number;
    simpleTable: boolean;
    accountPeriods: AccountPeriod[];
    financeData?: FinanceAccountResponse;
    noteTitle: string;
    noteBody: string;

    get headerColor(): string {
        if (this.frontStyle.headerColor) {
            return `background: ${this.frontStyle.headerColor};`;
        }

        return '';
    }
}

export interface AccountPeriod {
    accountPeriodId: number;
    accountId: number;
    initialDate: string;
    endDate: string;
    name?: string;
}

export interface AccountPeriodEventArg {
    accountPeriod: AccountPeriod;
    trxFilters: TrxFilters | null;
}

export interface AccRow {
    accounts: AccountGroupAccount[];
}

export interface BankGroups {
    financialEntityId?: number;
    financialEntityName: string;
    accounts: FinancialSummaryAccount[];
}

export interface TransactionViewModel {
    description: string;
    spendId: number;
    spendDate: Date;
    setPaymentDate?: Date;
    originalAmount: number;
    selectedCurrency: Currency | undefined;
    accountsIncluded: SlcTrxAccountIncluded[];
    spendTypeViewModels: SelectableItem[];
    selectedSpendTypeId?: number;
    accountName: string;
    isPending: boolean;
    trxTypeId: number;
    hasBankTrx: boolean;
}
export enum BalanceTypes {
    Invalid = 0, Custom = 1, AccountPeriodBalance = 2, AccountOverallBalance = 3
}

export class BankTrxReqRespPair {
    original: BankTrxItemReqResp;
    current: BankTrxItemReqResp;
    multipleTrxReq: boolean;
    resetRequested: boolean;
    accounts: AccountWithTrxTypeId[];

    canModifyTrxs(): boolean {
        return this.current.dbStatus === BankTransactionStatus.Inserted;
    }

    multipleTrxMode(): boolean {
        return this.multipleTrxReq || this.current.processData?.transactions?.length > 0;
    }

    getAccountTooltip(): string {
        const account = this.accounts.find(a => a.id === this.current.singleTrxAccountId);
        if (account) {
            return account.name;
        } else {
            return '';
        }
    }

    getHashedId(): string {
        return `${this.current.financialEntityId}-${this.current.fileTransaction.transactionId}`;
    }

    get isIgnored(): boolean {
        return this.current.dbStatus === BankTransactionStatus.Ignored;
    }

    set isIgnored(value: boolean) {
        if (value) {
            this.current.dbStatus = BankTransactionStatus.Ignored;
        }
        else {
            this.current.dbStatus = this.original.dbStatus === BankTransactionStatus.Ignored ? BankTransactionStatus.Inserted : this.original.dbStatus;
        }
    }
}