import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { NavBarServiceService } from '../services/main-nav-bar/nav-bar-service.service';
import { AccountGroup } from './models';
import { MainViewApiService } from '../services/main-view-api.service';
import { MainViewModel } from './main-view-model';
import { ItemModifiedRes } from '../services/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { UserError } from '../error-modal/models';

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
  }

  ngOnInit(): void {

    this.mainViewModel.errorNotification$.subscribe(error => {
      this.handleHttpError(error);
    })

    this.mainViewModel.listenAccountsModified().subscribe(modifiedItems => {
      this.loadModifiedAccountFinanance(modifiedItems);
    });

    this.mainViewApiService.loadMainAccountGroups().subscribe((response => {
      this.groups = response.sort((a, b) => a.accountGroupPosition > b.accountGroupPosition ? 1 : -1);
      this.mainViewModel.activeIds = this.groups.filter(x => x.isSelected).map(x => MainViewModel.getAccountGroupIdPattern(x.id));
      this.mainViewModel.updateData(this.groups);
      const perioIds = this.mainViewModel.getAllSelectedPeriodIds();
      this.loadAccountFinanance(perioIds);
    }));
  }

  private loadModifiedAccountFinanance(modifiedItems: ItemModifiedRes[]) {
    const periodIds = modifiedItems.map(md => this.mainViewModel.periodIds[md.accountId]);
    this.loadAccountFinanance(periodIds);
  }

  private loadAccountFinanance(accountPeriodIds: number[]) {
    this.mainViewApiService.loadAccountFinanance(accountPeriodIds, this.mainViewModel.showPendings).subscribe(res => {
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
