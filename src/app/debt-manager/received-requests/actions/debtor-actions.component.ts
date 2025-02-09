import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DebtorRequestStatus, DebtRequestVm } from 'src/app/services/models';

@Component({
  selector: 'app-debtor-actions',
  templateUrl: './debtor-actions.component.html',
  styleUrls: ['./debtor-actions.component.css']
})
export class DebtorActionsComponent {
  @Input()
  debtRequest: DebtRequestVm | null = null;

  @Output()
  statusChanged: EventEmitter<{ debtRequest: DebtRequestVm, status: number }> = new EventEmitter();


  get rejectBtnEnabled(): boolean {
    if (this.debtRequest?.creditor === null || this.debtRequest?.debtor === null)
      return false;

    return this.debtRequest?.debtor.status === DebtorRequestStatus.Pending;
  }

  get confirmPaymentBtnEnabled(): boolean {
    if (this.debtRequest?.creditor === null || this.debtRequest?.debtor === null)
      return false;

    return this.debtRequest?.debtor.status === DebtorRequestStatus.Pending;
  }

  get resetBtnEnabled(): boolean {
    if (this.debtRequest?.creditor === null || this.debtRequest?.debtor === null)
      return false;

    return this.debtRequest?.debtor.status !== DebtorRequestStatus.Pending;
  }

  onRejectBtnClick() {
    this.statusChanged.emit({ debtRequest: this.debtRequest!, status: DebtorRequestStatus.Rejected });
  }

  onConfirmPaymentBtnClick() {
    this.statusChanged.emit({ debtRequest: this.debtRequest!, status: DebtorRequestStatus.Paid });
  }

  onResetBtnClick() {
    this.statusChanged.emit({ debtRequest: this.debtRequest!, status: DebtorRequestStatus.Pending });
  }
}
