import { Currency, FinanceAccountResponse, FinancialSummaryAccount, SelectableItem, SlcTrxAccountIncluded, TrxAccountIncluded } from "../services/models";

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
}
export enum BalanceTypes {
    Invalid = 0, Custom = 1, AccountPeriodBalance = 2, AccountOverallBalance = 3
}