import { Component, OnInit } from '@angular/core';
import { DebtManagerApiService } from '../services/debt-manager-api.service';
import { DebtRequestVm, ItemModifiedRes } from '../services/models';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DebtRequestTrxsComponent } from './debt-request-trxs/debt-request-trxs.component';
import { MainViewModel } from '../main-view/main-view-model';
import { ToasterService } from '../services/toaster.service';

// possible states for the active tab

const TABS = {
  SUBMITTED: 1,
  RECEIVED: 2,
  CREATE: 3
}

@Component({
  selector: 'app-debt-manager',
  templateUrl: './debt-manager.component.html',
  styleUrls: ['./debt-manager.component.css']
})
export class DebtManagerComponent implements OnInit {

  active = TABS.SUBMITTED;

  private _debtRequests: DebtRequestVm[] = [];

  constructor(
    private service: DebtManagerApiService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private mainViewModel: MainViewModel,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['action']) {
        const suppliedAction = Number(params['action']);
        if (suppliedAction && Object.values(TABS).includes(suppliedAction)) {
          this.active = suppliedAction;
        }
      }
    });
    this.service.getDebtsRequests().subscribe(data => {
      this._debtRequests = data;
    });
  }

  get submittedDebtRequests(): DebtRequestVm[] {
    return this._debtRequests.filter(x => x.createdByMe);
  }

  get receivedDebtRequests(): DebtRequestVm[] {
    return this._debtRequests.filter(x => !x.createdByMe);
  }

  onAddRequestCancellationRequested() {
    this.active = TABS.SUBMITTED;
  }

  onAddRequestSubmitted(debtRequest: DebtRequestVm) {
    this._debtRequests.push(debtRequest);
    this.active = TABS.SUBMITTED;
  }

  onCreditorDebtRequestStatusChanged({ debtRequest, status }: { debtRequest: DebtRequestVm, status: number }) {
    this.service.updateCreditorStatus(debtRequest.id, status).subscribe(data => {
      this.updateDebtRequest(data);
      this.notifyModifiedAccounts(data);
    });
  }

  onTransactionsClicked(debtRequest: DebtRequestVm, fromSubmitted: boolean) {
    const modalRef = this.modalService.open(DebtRequestTrxsComponent, { backdrop: 'static', keyboard: false, size: 'lg' });
    modalRef.componentInstance.debtRequestVm = debtRequest;
    modalRef.componentInstance.fromSubmitted = fromSubmitted;
    modalRef.closed.subscribe((modifiedAccounts: ItemModifiedRes[]) => {
      if (Array.isArray(modifiedAccounts) && modifiedAccounts.length) {
        this.mainViewModel.notifyAccountsModified(modifiedAccounts);
      }
    });
  }

  onDebtorDebtRequestStatusChanged({ debtRequest, status }: { debtRequest: DebtRequestVm, status: number }) {
    this.service.updateDebtorStatus(debtRequest.id, status).subscribe(data => {
      this.updateDebtRequest(data);
      this.notifyModifiedAccounts(data);
    });
  }

  private notifyModifiedAccounts(debtRequest: DebtRequestVm) {
    if (debtRequest.modifiedTrxs?.length) {
      this.mainViewModel.notifyAccountsModified(debtRequest.modifiedTrxs);
      this.toasterService.success(`${debtRequest.modifiedTrxs.length} account/s updated`);
    }
  }

  updateDebtRequest(debtRequest: DebtRequestVm) {
    const index = this._debtRequests.findIndex(x => x.id === debtRequest.id);
    if (index !== -1) {
      const currentDebtRequest = this._debtRequests[index];
      debtRequest.isSelected = currentDebtRequest.isSelected;
      this._debtRequests[index] = { ...debtRequest };
    }
  }
}
