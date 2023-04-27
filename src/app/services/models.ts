export interface ApiCredentials {
    username: string,
    password: string
}

export interface TokenResponse {
    accessToken: string,
    expiresIn: number
}

export interface StoredToken {
    accessToken: string,
    expireDate: Date
}

export interface FinanceAccountRequest{
    accountPeriodId: number;
    pendingSpends: boolean;
    loanSpends: boolean;
    amountTypeId: number;
}

export interface SpendViewModel{
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

export interface FinanceAccountResponse{
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
}

