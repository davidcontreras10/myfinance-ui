import { EventEmitter, Injectable } from "@angular/core";
import { AccountGroup, AccountGroupAccount, AccountPeriod, AccountPeriodEventArg, BankGroups, MainViewPrefs } from "./models";
import { Observable, Subject, filter, observable, takeLast } from "rxjs";
import { FinanceAccountResponse, ItemModifiedRes, TrxFilters } from "../services/models";

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

    private periodChangeEvent$ = new Subject<AccountPeriodEventArg>();
    private accountsModified$ = new Subject<ItemModifiedRes[]>();
    private accountsModelChanged$ = new Subject<FinanceAccountResponse[]>();

    public getFinanceAccountData(accountPeriodIds: number[]): { finance: FinanceAccountResponse, accountPeriodId: number }[] {
        const financeAccs: { finance: FinanceAccountResponse, accountPeriodId: number }[] = [];
        accountPeriodIds.forEach(id => {
            for (let accg of this.accountGroups) {
                for (let acc of accg.accounts) {
                    if (acc.financeData && acc.accountPeriods.some(accp => accp.accountPeriodId === id)) {
                        financeAccs.push({
                            accountPeriodId: id,
                            finance: acc.financeData
                        });
                        return;
                    }
                }
            }
        });

        return financeAccs;
    }

    public listenAccountsModelChanges(): Observable<FinanceAccountResponse[]> {
        return this.accountsModelChanged$.asObservable();
    }

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
        if (financeAccounts) {
            this.forEachAccount(acc => {
                const financeAccount = financeAccounts.find(f => f.accountId === acc.accountId);
                if (financeAccount) {
                    acc.financeData = financeAccount;
                }
            });
            this.accountsModelChanged$.next(financeAccounts);
        }
    }

    public getAllSelectedPeriodIds(): number[] {
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

    public notifyPeriodChange(accountPeriodId: number, trxFilters: TrxFilters | null = null): void {
        const period = this.getAccountPeriodById(accountPeriodId);
        this.periodChangeEvent$.next({
            accountPeriod: period,
            trxFilters: trxFilters
        });
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

    public listenOnPeriodChange(accountId: number): Observable<AccountPeriodEventArg> {
        return this.periodChangeEvent$.pipe(
            filter(x => x.accountPeriod.accountId === accountId)
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