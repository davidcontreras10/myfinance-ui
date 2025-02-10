import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DebtorRequestStatus, DebtRequestVm } from 'src/app/services/models';

@Component({
  selector: 'app-received-requests',
  templateUrl: './received-requests.component.html',
  styleUrls: ['./received-requests.component.css']
})
export class ReceivedRequestsComponent {

  @Output()
  statusChanged: EventEmitter<{ debtRequest: DebtRequestVm, status: number }> = new EventEmitter();

  @Input()
  debtRequests: DebtRequestVm[] = [];
  isAllSelected: boolean = false;
  showPaid: boolean = false;
  showRejected: boolean = false;

  get filteredDebtRequests(): DebtRequestVm[] {
    return this.debtRequests
      .filter(req => {
        const isPending = req.debtor.status === DebtorRequestStatus.Pending;
        const isPaid = this.showPaid && req.debtor.status === DebtorRequestStatus.Paid;
        const isRejected = this.showRejected && req.debtor.status === DebtorRequestStatus.Rejected;
        return isPending || isPaid || isRejected;
      });
  }

  toggleAllSelection(): void {
    this.debtRequests?.forEach(req => req.isSelected = this.isAllSelected);
  }

  toggleSelection(req: DebtRequestVm): void {
    this.checkAllSelected();
  }

  anySelected(): boolean {
    return this.debtRequests.some(req => req.isSelected);
  }

  checkAllSelected(): void {
    this.isAllSelected = ((this.debtRequests?.length ?? 0) > 0)
      && (this.debtRequests?.every(req => req.isSelected) ?? false);
  }

  onDebtRequestStatusChanged({ debtRequest, status }: { debtRequest: DebtRequestVm, status: number }) {
    this.statusChanged.emit({ debtRequest, status });
  }

  getStatusText(status: number): string {
    switch (status) {
      case DebtorRequestStatus.Pending:
        return 'Pending';
      case DebtorRequestStatus.Rejected:
        return 'Rejected';
      case DebtorRequestStatus.Paid:
        return 'Paid';
      default:
        return 'Unknown';
    }
  }

}
