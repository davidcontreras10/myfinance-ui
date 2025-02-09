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

  onArchiveBtnClick() {
    this.statusChanged.emit({ debtRequest: this.debtRequest!, status: CreditorRequestStatus.Archived });
  }

  onConfirmPaymentBtnClick() {
    this.statusChanged.emit({ debtRequest: this.debtRequest!, status: CreditorRequestStatus.Paid });
  }

  onResetBtnClick() {
    this.statusChanged.emit({ debtRequest: this.debtRequest!, status: CreditorRequestStatus.Pending });
  }
}
