import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreditorRequestStatus, DebtorRequestStatus, DebtRequestVm } from 'src/app/services/models';

@Component({
  selector: 'app-submitted-debt-requests',
  templateUrl: './submitted-debt-requests.component.html',
  styleUrls: ['./submitted-debt-requests.component.css']
})
export class SubmittedDebtRequestsComponent {

  @Output()
  statusChanged: EventEmitter<{ debtRequest: DebtRequestVm, status: number }> = new EventEmitter();

  @Input()
  debtRequests: DebtRequestVm[] = [];
  isAllSelected: boolean = false;
  showPaid: boolean = false;
  showArchived: boolean = false;

  get filteredDebtRequests(): DebtRequestVm[] {
    return this.debtRequests
      .filter(req => {
        const isPending = req.creditor.status === CreditorRequestStatus.Pending;
        const isPaid = this.showPaid && req.creditor.status === CreditorRequestStatus.Paid;
        const isArchived = this.showArchived && req.creditor.status === CreditorRequestStatus.Archived;
        return isPending || isPaid || isArchived;
      });
  }

  toggleAllSelection(): void {
    this.debtRequests?.forEach(req => req.isSelected = this.isAllSelected);
  }

  anySelected(): boolean {
    return this.debtRequests.some(req => req.isSelected);
  }

  toggleSelection(req: DebtRequestVm): void {
    this.checkAllSelected();
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
      case CreditorRequestStatus.Pending:
        return 'Pending';
      case CreditorRequestStatus.Archived:
        return 'Archived';
      case CreditorRequestStatus.Paid:
        return 'Paid';
      default:
        return 'Unknown';
    }
  }
}
