import { AccountWithTrxTypeId, BankTransactionStatus, BankTrxItemReqResp, BankTrxSpendViewModel, Currency, FinanceAccountResponse, FinancialSummaryAccount, SelectableItem, SlcTrxAccountIncluded, TrxFilters } from "../services/models";
import { Utils } from "../utils";

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
    transferInfo: {
        sourceAccountName: string,
        destinationAccountName: string,
    } | null;
}
export enum BalanceTypes {
    Invalid = 0, Custom = 1, AccountPeriodBalance = 2, AccountOverallBalance = 3
}

export class BankTrxReqRespPair {
    original: BankTrxItemReqResp;
    current: BankTrxItemReqResp;
    resetRequested: boolean;
    accounts: AccountWithTrxTypeId[];

    getTrxDate(): Date | null {
        if (this.current.fileTransaction.transactionDate === this.original.fileTransaction.transactionDate) {
            return null;
        }

        return this.current.fileTransaction.transactionDate;
    }

    removeTrx(trx: BankTrxSpendViewModel) {
        const index = this.current.processData.transactions.indexOf(trx);
        if (index > -1) {
            this.current.processData.transactions.splice(index, 1);
        }
    }

    addTrx() {
        const maxSpendId = Math.max(...this.current.processData.transactions.map(t => t.spendId));
        this.current.processData.transactions.push(this.createAppTransactionTemplate(maxSpendId + 1));
    }

    get areTrxsValid(): boolean {
        return true;
    }

    get areTrxsAmountsValid(): boolean {
        if (!this.isMultipleTrx) {
            return true;
        }

        // Comparing raw sums with === is unreliable here: e.g. 10 + 5.53 !== 15.53 due to
        // binary floating point rounding, even though they're equal to the cent. Round
        // both sides to the nearest cent before comparing.
        return Utils.roundToCents(this.totalTrxsAmount) === Utils.roundToCents(this.current.fileTransaction.originalAmount);
    }

    get totalTrxsAmount(): number {
        let total = 0;
        if (this.current.processData.transactions) {
            this.current.processData.transactions.forEach(t => {
                total += t.originalAmount ?? 0;
            });
        }

        return total;
    }

    canModifyTrxs(): boolean {
        return this.current.dbStatus === BankTransactionStatus.Inserted;
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

    createAppTransactionTemplate(id: number): BankTrxSpendViewModel {
        return {
            accountId: this.current.singleTrxAccountId,
            spendId: id,
            spendDate: this.current.fileTransaction.transactionDate,
            description: this.current.fileTransaction.description,
            spendTypeId: this.current.singleTrxTypeId,
            originalAmount: null,
            isPending: this.current.singleTrxIsPending ?? false,
            accounts: [],
            amountCurrencyId: 0,
            convertedAmount: 0,
            setPaymentDate: null,
        };
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
            this.current.processData.transactions = [];
        }
    }

    set isMultipleTrx(value: boolean) {
        if (!value) {
            this.current.processData.transactions = [];
        }
        else {
            this.current.processData.transactions = [this.createAppTransactionTemplate(0), this.createAppTransactionTemplate(1)];
        }
    }

    get isMultipleTrx(): boolean {
        return !this.isIgnored && this.current?.processData?.transactions?.length > 1;
    }
}

export interface AIClassifiedBankTrx {
    id: string;
    trxTypeId: number;
    accountId: number;
}

