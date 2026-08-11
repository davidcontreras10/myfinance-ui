import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SpendViewModel } from 'src/app/services/models';
import { AccountGroupAccount } from '../../models';
import { MainViewModel } from '../../main-view-model';

// Below this many transactions there's nothing to be "compact" about - the
// toggle would just be noise on a list that's already short.
const COMPACT_VIEW_MIN_TRX_COUNT = 4;

@Component({
  selector: 'app-trx-table',
  templateUrl: './trx-table.component.html',
  styleUrls: ['./trx-table.component.css']
})
export class TrxTableComponent implements OnInit {

  @Output()
  bankTrxView = new EventEmitter<SpendViewModel>();

  @Output()
  confirmTransaction = new EventEmitter<SpendViewModel>();

  @Output()
  trxDelete = new EventEmitter<SpendViewModel>();

  @Output()
  selectedDelete = new EventEmitter<SpendViewModel[]>();

  @Output()
  selectedConfirm = new EventEmitter<SpendViewModel[]>();

  @Output()
  trxEdit = new EventEmitter<SpendViewModel>();

  @Input()
  acc: AccountGroupAccount;

  isAllSelected: boolean = false;

  // Desktop-only density switch (see the toolbar's .trx-density-toggle,
  // hidden below a wider container-query threshold than the one that turns
  // the mobile stack into a single detailed row - a compact card needs
  // roughly two detailed rows' worth of width to show two of them side by
  // side without cramping).
  viewMode: 'detailed' | 'compact' = 'detailed';

  get canShowCompactView(): boolean {
    return (this.acc?.financeData?.spendViewModels?.length ?? 0) > COMPACT_VIEW_MIN_TRX_COUNT;
  }

  constructor(private mainViewModel: MainViewModel) { }

  ngOnInit(): void {
    this.mainViewModel.listenAccountsModelChanges().subscribe(items => {
      if (items.some(item => item.accountId === this.acc.accountId)) {
        this.checkAllSelected();
      }
    })
  }

  getSpendViewModels(): SpendViewModel[] | undefined {
    return this.acc?.financeData?.spendViewModels?.sort((a, b) => {
      const aDate = new Date(a.spendDate);
      const bDate = new Date(b.spendDate);
      return bDate.getTime() - aDate.getTime();
    })
  }

  onBankTrxView(_t13: SpendViewModel) {
    this.bankTrxView.emit(_t13);
  }

  onConfirmTransaction(_t13: SpendViewModel) {
    this.confirmTransaction.emit(_t13);
  }
  onTrxDelete(_t13: SpendViewModel) {
    this.trxDelete.emit(_t13);
  }
  onTrxEdit(_t13: SpendViewModel) {
    this.trxEdit.emit(_t13);
  }

  toggleSelection(_t13: SpendViewModel): void {
    this.checkAllSelected();
  }

  checkAllSelected(): void {
    this.isAllSelected = ((this.acc?.financeData?.spendViewModels?.length ?? 0) > 0)
      && (this.acc?.financeData?.spendViewModels?.every(trx => trx.vmIsSelected) ?? false);
  }

  toggleAllSelection(): void {
    this.acc?.financeData?.spendViewModels?.forEach(trx => trx.vmIsSelected = this.isAllSelected);
  }

  // Clears the selection without acting on it - the "x" on the bulk-action bar.
  clearSelection(): void {
    this.acc?.financeData?.spendViewModels?.forEach(trx => trx.vmIsSelected = false);
    this.isAllSelected = false;
  }

  setViewMode(mode: 'detailed' | 'compact'): void {
    this.viewMode = mode;
  }

  anySelected() {
    return this.acc?.financeData?.spendViewModels?.some(trx => trx.vmIsSelected) ?? false;
  }

  anyPending() {
    return this.acc?.financeData?.spendViewModels?.some(trx => trx.vmIsSelected && trx.isPending) ?? false;
  }

  onDeleteAllSelected() {
    this.selectedDelete.emit(this.acc.financeData?.spendViewModels.filter(s => s.vmIsSelected));
  }

  onConfirmAllSelected() {
    this.selectedConfirm.emit(this.acc?.financeData?.spendViewModels?.filter(trx => trx.vmIsSelected && trx.isPending));
  }

  selectedItemsCount(): number {
    return this.acc?.financeData?.spendViewModels?.filter(x => x.vmIsSelected)?.length ?? 0;
  }
}
