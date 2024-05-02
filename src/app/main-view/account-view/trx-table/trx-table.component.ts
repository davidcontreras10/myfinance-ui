import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SpendViewModel } from 'src/app/services/models';
import { AccountGroupAccount } from '../../models';
import { MainViewModel } from '../../main-view-model';

@Component({
  selector: 'app-trx-table',
  templateUrl: './trx-table.component.html',
  styleUrls: ['./trx-table.component.css']
})
export class TrxTableComponent implements OnInit {

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
