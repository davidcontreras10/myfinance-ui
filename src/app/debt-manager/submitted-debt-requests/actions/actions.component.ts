import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreditorRequestStatus, DebtRequestVm } from 'src/app/services/models';

@Component({
  selector: 'app-creditor-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.css']
})
export class ActionsComponent {
  @Input()
  debtRequest: DebtRequestVm | null = null;

  @Output()
  statusChanged: EventEmitter<{ debtRequest: DebtRequestVm, status: number }> = new EventEmitter();

  @Output()
  transactionsClicked: EventEmitter<{ debtRequest: DebtRequestVm, fromSubmitted: boolean }> = new EventEmitter();

  get archiveBtnEnabled(): boolean {
    if (this.debtRequest?.creditor === null || this.debtRequest?.debtor === null)
      return false;

    if (this.debtRequest?.creditor.status !== CreditorRequestStatus.Pending)
      return false;

    if (this.debtRequest?.debtor.status === CreditorRequestStatus.Paid)
      return false;

    return true;
  }

  get confirmPaymentBtnEnabled(): boolean {
    if (this.debtRequest?.creditor === null || this.debtRequest?.debtor === null)
      return false;

    if (this.debtRequest?.creditor.status !== CreditorRequestStatus.Pending)
      return false;

    return true;
  }

  get resetBtnEnabled(): boolean {
    if (this.debtRequest?.creditor === null || this.debtRequest?.debtor === null)
      return false;

    if (this.debtRequest?.creditor.status === CreditorRequestStatus.Pending)
      return false;

    return true;
  }

  get trxBtnEnabled(): boolean {
    if (this.debtRequest?.creditor === null || this.debtRequest?.debtor === null)
      return false;

    return (this.debtRequest?.debtor.status === CreditorRequestStatus.Pending) || ((this.debtRequest?.trxCount ?? 0) > 0);
  }

  onArchiveBtnClick() {
    this.statusChanged.emit({ debtRequest: this.debtRequest!, status: CreditorRequestStatus.Archived });
  }

  onConfirmPaymentBtnClick() {
    if (this.debtRequest) {
      if (this.debtRequest.trxCount > 0) {
        if (confirm("This will also confirm the transactions in its accounts. Are you sure?")) {
          this.statusChanged.emit({ debtRequest: this.debtRequest, status: CreditorRequestStatus.Paid });
        }
      } else {
        this.statusChanged.emit({ debtRequest: this.debtRequest, status: CreditorRequestStatus.Paid });
      }
    }
  }

  onResetBtnClick() {
    if (this.debtRequest) {
      if (this.debtRequest.trxCount > 0) {
        if (confirm("This will also DELETE the transactions in its accounts. Are you sure?")) {
          this.statusChanged.emit({ debtRequest: this.debtRequest, status: CreditorRequestStatus.Pending });
        }
      } else {
        this.statusChanged.emit({ debtRequest: this.debtRequest, status: CreditorRequestStatus.Pending });
      }
    }
  }

  onTransactionsBtnClick() {
    if (this.debtRequest) {
      this.transactionsClicked.emit({ debtRequest: this.debtRequest, fromSubmitted: true });
    }
  }


}
