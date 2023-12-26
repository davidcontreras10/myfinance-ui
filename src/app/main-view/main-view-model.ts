import { Injectable } from "@angular/core";
import { AccountGroup, AccountGroupAccount, AccountPeriod, BankGroups, MainViewPrefs } from "./models";
import { Observable, Subject, filter, takeLast } from "rxjs";
import { FinanceAccountResponse, ItemModifiedRes } from "../services/models";

@Injectable({
    providedIn: 'root'
})
export class MainViewModel {
    public accountGroups: AccountGroup[] = [];
    public periodIds: { [key: number]: number } = {};
    public activeIds: string[] = [];
    public showPendings: true;
    public bankGroups: BankGroups[];
    public errorNotification$ = new Subject<Error>();
    public mainViewPrefs: MainViewPrefs;

    private periodChangeEvent$ = new Subject<AccountPeriod>();
    private accountsModified$ = new Subject<ItemModifiedRes[]>();

    public listenAccountsModified(): Observable<ItemModifiedRes[]> {
        return this.accountsModified$.asObservable();
    }

    public notifyAccountsModified(modifieds: ItemModifiedRes[]) {
        this.accountsModified$.next(modifieds);
    }

    public static getAccountGroupIdPattern(id: number): string {
        return `acc_toggle_${id}`;
    }

    public updateFinanceInfo(financeAccounts: FinanceAccountResponse[]) {
        this.forEachAccount(acc => {
            const financeAccount = financeAccounts.find(f => f.accountId === acc.accountId);
            if (financeAccount) {
                acc.financeData = financeAccount;
            }
        })
    }

    public getAllSelectedPeriodIds() {
        const ids: number[] = [];
        for (const prop in this.periodIds) {
            ids.push(this.periodIds[prop]);
        }

        return ids;
    }

    public updateAccountData(accountGroups: AccountGroup[]) {
        this.accountGroups = accountGroups;
        this.forEachAccount(acc => {
            this.periodIds[acc.accountId] = acc.currentPeriodId;
            this.notifyPeriodChange(acc.currentPeriodId);
        });
    }

    public notifyPeriodChange(accountPeriodId: number): void {
        const period = this.getAccountPeriodById(accountPeriodId);
        this.periodChangeEvent$.next(period);
    }

    public getAccountPeriodById(accountPeriodId: number): AccountPeriod {
        let accountPeriod!: AccountPeriod;
        this.forEachAccount(acc => {
            if (acc.accountPeriods) {
                acc.accountPeriods.every((accp) => {
                    if (accp.accountPeriodId === accountPeriodId) {
                        accountPeriod = accp;
                        return false;
                    }

                    return true;
                })
            }
        })

        return accountPeriod;
    }

    public listenOnPeriodChange(accountId: number): Observable<AccountPeriod> {
        return this.periodChangeEvent$.pipe(
            filter(x => x.accountId === accountId)
        )
    }

    private forEachAccount(accountCallback: (acc: AccountGroupAccount) => any) {
        if (this.accountGroups) {
            this.accountGroups.forEach((accg) => {
                if (accg.accounts) {
                    accg.accounts.forEach(acc => {
                        accountCallback(acc);
                    })
                }
            })
        }
    }

}