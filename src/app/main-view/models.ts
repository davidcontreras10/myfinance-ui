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

    get headerColor(): string {
        if(this.frontStyle.headerColor){
            return `background: ${this.frontStyle.headerColor};`;
        }

        return '';
    }
}

export interface AccountPeriod {
    accountPeriodId: number;
    accountId: number;
    initialDate: Date;
    endDate: Date;
    name: string;
}

export interface AccRow {
    accounts: AccountGroupAccount[];
}