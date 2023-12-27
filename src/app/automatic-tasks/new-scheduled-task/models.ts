export interface NewScheduledTask{
    amount: number;
    spendTypeId: number;
    currencyId: number;
    description: string;
    frequencyType: number;
    days: number[];
    accountId: number;
}

export interface BasicNewScheduledTask extends NewScheduledTask{
    isSpendTrx: boolean | null;
}

export interface TransferNewScheduledTask extends NewScheduledTask{
    toAccountId: number;
}