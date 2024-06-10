import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { NavBarMenusIds, NavBarServiceService } from '../services/main-nav-bar/nav-bar-service.service';
import { AccountGroup } from './models';
import { MainViewApiService } from '../services/main-view-api.service';
import { MainViewModel } from './main-view-model';
import { GetFinanceReq, ItemModifiedRes } from '../services/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { UserError } from '../error-modal/models';
import { MainViewPrefsComponent } from './main-view-prefs/main-view-prefs.component';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css'],
  providers: [AuthGuard]
})
export class MainViewComponent implements OnInit {
  public showBankSummary = true;
  public groups: AccountGroup[] = [];
  public bankSummaryloading = false;

  constructor(private modalService: NgbModal, navBarService: NavBarServiceService, private mainViewApiService: MainViewApiService, public mainViewModel: MainViewModel) {
    navBarService.getSubMenuEvents('toggle-summary').subscribe((value) => {
      this.handleIncomingNavBarAction(value);
    });
    navBarService.getSubMenuEvents(NavBarMenusIds.MAIN_VIEW_PREFS, NavBarMenusIds.SET_PERIODS_DATE).subscribe(value => {
      if (value === NavBarMenusIds.MAIN_VIEW_PREFS) {
        this.openPreferencesModal();
      }
      else if (value === NavBarMenusIds.SET_PERIODS_DATE) {
        const periodIds = [this.mainViewModel.getAllSelectedPeriodIds()[0]];
        this.loadAccountFinananceByIds(periodIds, new Date('2024/03/25'));
      }
    })
  }

  ngOnInit(): void {

    this.mainViewModel.errorNotification$.subscribe(error => {
      this.handleHttpError(error);
    })

    this.mainViewModel.listenAccountsModified().subscribe(modifiedItems => {
      this.loadModifiedAccountFinanance(modifiedItems, undefined);
    });

    this.mainViewApiService.getMainViewPrefs().subscribe(response => {
      this.mainViewModel.mainViewPrefs = response;
    });

    this.mainViewApiService.loadMainAccountGroups().subscribe((response => {
      this.groups = response.sort((a, b) => a.accountGroupPosition > b.accountGroupPosition ? 1 : -1);
      this.mainViewModel.activeIds = this.groups.filter(x => x.isSelected).map(x => MainViewModel.getAccountGroupIdPattern(x.id));
      this.mainViewModel.updateAccountData(this.groups);
      const periodIds = this.mainViewModel.getAllSelectedPeriodIds();
      this.loadAccountFinananceByIds(periodIds, undefined);
    }));
  }

  private loadModifiedAccountFinanance(modifiedItems: ItemModifiedRes[], expectedDate: Date | undefined) {
    const periodIds = modifiedItems.map(md => this.mainViewModel.periodIds[md.accountId]);
    this.loadAccountFinananceByIds(periodIds, expectedDate);
  }

  private loadAccountFinananceByIds(accountPeriodIds: number[], expectedDate: Date | undefined) {
    const financeValues = this.mainViewModel.getFinanceAccountData(accountPeriodIds);
    const request: GetFinanceReq[] = [];
    accountPeriodIds.forEach(accountPeriodId => {
      const financeValue = financeValues.find(v => v.accountPeriodId === accountPeriodId);
      request.push({
        accountPeriodId,
        trxFilters: financeValue?.finance?.trxFilters
      })
    });
    this.loadAccountFinanance(request, expectedDate);
  }

  private loadAccountFinanance(accountPeriods: GetFinanceReq[], expectedDate: Date | undefined) {
    this.mainViewApiService.loadAccountFinanance(accountPeriods, this.mainViewModel.showPendings, expectedDate).subscribe(res => {
      this.mainViewModel.updateFinanceInfo(res);
      this.loadFinanceSummary();
    });
  }

  private loadFinanceSummary() {
    this.bankSummaryloading = true;
    this.mainViewApiService.loadAccountFinanceSummary().subscribe({
      next: financeSummary => {
        this.bankSummaryloading = false;
        this.mainViewModel.bankGroups = financeSummary;
      },
      error: err => {
        this.bankSummaryloading = false;
        console.error(err);
      }
    });
  }

  private handleIncomingNavBarAction(action: string) {
    if (action === 'toggle-summary') {
      this.showBankSummary = !this.showBankSummary;
    }
  }

  private openPreferencesModal() {
    this.modalService.open(MainViewPrefsComponent, { backdrop: true, size: 'md' });
  }

  private handleHttpError(paramError: Error) {
    let modalError;
    if (paramError instanceof HttpErrorResponse) {
      const httpErrorResponse = paramError as HttpErrorResponse;
      modalError = UserError.fromHttpErrorResponse(httpErrorResponse);
    }
    else {
      modalError = paramError;
    }
    const modalRef = this.modalService.open(ErrorModalComponent, { centered: true });
    modalRef.componentInstance.error = modalError;
  }
}
