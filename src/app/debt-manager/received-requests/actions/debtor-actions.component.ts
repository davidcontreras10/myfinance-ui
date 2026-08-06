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

  @Output()
  transactionsClicked: EventEmitter<{ debtRequest: DebtRequestVm, fromSubmitted: boolean }> = new EventEmitter();

  constructor() { }


  get rejectBtnEnabled(): boolean {
    if (this.debtRequest?.creditor === null || this.debtRequest?.debtor === null)
      return false;

    return this.debtRequest?.debtor.status === DebtorRequestStatus.Pending;
  }

  get trxBtnEnabled(): boolean {
    if (this.debtRequest?.creditor === null || this.debtRequest?.debtor === null)
      return false;

    return (this.debtRequest?.debtor.status === DebtorRequestStatus.Pending) || ((this.debtRequest?.trxCount ?? 0) > 0);
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
    if (this.debtRequest) {
      if (this.debtRequest.trxCount > 0) {
        if (confirm("This will also confirm the transactions in its accounts. Are you sure?")) {
          this.statusChanged.emit({ debtRequest: this.debtRequest, status: DebtorRequestStatus.Paid });
        }
      } else {
        this.statusChanged.emit({ debtRequest: this.debtRequest, status: DebtorRequestStatus.Paid });
      }
    }
  }

  onResetBtnClick() {
    if (this.debtRequest) {
      if (this.debtRequest.trxCount > 0) {
        if (confirm("This will also DELETE the transactions in its accounts. Are you sure?")) {
          this.statusChanged.emit({ debtRequest: this.debtRequest, status: DebtorRequestStatus.Pending });
        }
      } else {
        this.statusChanged.emit({ debtRequest: this.debtRequest, status: DebtorRequestStatus.Pending });
      }
    }
  }

  onTransactionsBtnClick() {
    if (this.debtRequest) {
      this.transactionsClicked.emit({ debtRequest: this.debtRequest, fromSubmitted: false });
    }
  }
}
