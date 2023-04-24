export interface AccountGroup {
    id: number;
    name: string;
    accounts: string[],
    isActive: boolean
}

export class AccRow {
    accounts: string[] = []
}