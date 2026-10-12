import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrxTypeServiceService } from '../services/trx-type-service.service';
import { TrxTypeViewModel } from '../services/models';
import { EditedArgs, NewTrxTypeDialogResult, TrxEventArgs } from './models';
import { NavBarMenusIds, NavBarServiceService } from '../services/main-nav-bar/nav-bar-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewTransactionTypeComponent } from './new-transaction-type/new-transaction-type.component';

interface PageToast {
  message: string;
  isError: boolean;
}

@Component({
  standalone: false,
  selector: 'app-transaction-types',
  templateUrl: './transaction-types.component.html',
  styleUrls: ['./transaction-types.component.css']
})
export class TransactionTypesComponent implements OnInit, OnDestroy {

  private transactionTypes: TrxTypeViewModel[] = [];
  private menuSubscription?: Subscription;

  loading = true;
  filter = '';
  /** Which list is shown below the lg breakpoint, where only one fits */
  activePanel: 'mine' | 'available' = 'mine';
  toasts: PageToast[] = [];
  deleteTarget?: TrxTypeViewModel;
  highlightedId?: number;
  private highlightTimer?: ReturnType<typeof setTimeout>;
  readonly busyIds = new Set<number>();

  constructor(private apiService: TrxTypeServiceService, private menuService: NavBarServiceService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.menuSubscription = this.menuService
      .getSubMenuEvents(
        NavBarMenusIds.NEW_TRX_TYPE
      ).subscribe(() => this.openNewTypeDialog());

    this.loadTypes();
  }

  ngOnDestroy(): void {
    this.menuSubscription?.unsubscribe();
    clearTimeout(this.highlightTimer);
  }

  openNewTypeDialog() {
    const modal = this.modalService.open(NewTransactionTypeComponent, { backdrop: true, size: 'lg' });
    modal.result.then((res) => {
      const result = <NewTrxTypeDialogResult>res;
      if (result?.success && result.value) {
        this.transactionTypes.push(result.value);
        this.showToast(`"${result.value.name}" created.`);
      }
    }, () => { /* dialog dismissed */ });
  }

  onArrowChanged($event: TrxEventArgs) {
    const trxType = $event.trxType;
    if (this.busyIds.has(trxType.id)) {
      return;
    }

    const newIsSelected = !trxType.isSelected;
    this.busyIds.add(trxType.id);
    this.apiService.changeTrxTypeUserSelected(trxType.id, newIsSelected).subscribe({
      next: res => {
        this.busyIds.delete(trxType.id);
        if (res && res.length > 0) {
          trxType.isSelected = newIsSelected;
          this.highlight(trxType.id);
          this.showToast(newIsSelected ? `"${trxType.name}" added to My list.` : `"${trxType.name}" removed from My list.`);
        }
      },
      error: () => {
        this.busyIds.delete(trxType.id);
        this.showToast(`Unable to move "${trxType.name}".`, true);
      }
    });
  }

  onDeleted($event: TrxEventArgs, confirmDialog: TemplateRef<unknown>) {
    const trxType = $event.trxType;
    this.deleteTarget = trxType;
    this.modalService.open(confirmDialog, { backdrop: true, centered: true }).result.then(() => {
      this.apiService.deleteTrxType(trxType.id).subscribe({
        next: () => {
          const index = this.transactionTypes.findIndex(tr => tr.id === trxType.id);
          if (index !== -1) {
            this.transactionTypes.splice(index, 1);
          }
          this.showToast(`"${trxType.name}" deleted.`);
        },
        error: () => {
          this.showToast(`Unable to delete "${trxType.name}".`, true);
        }
      });
    }, () => { /* dialog dismissed */ });
  }

  onEdited($event: EditedArgs) {
    const requestModel = {
      isSelected: $event.trxType.isSelected,
      spendTypeDescription: $event.description,
      spendTypeId: $event.trxType.id,
      spendTypeName: $event.name
    };

    this.apiService.editTrxType(requestModel).subscribe({
      next: res => {
        this.updateReloadedTrxType(res);
        this.showToast('Saved.');
      },
      error: () => {
        this.showToast('Unable to save the change. Reloading the list.', true);
        this.loadTypes();
      }
    });
  }

  allItems(): TrxTypeViewModel[] {
    return this.applyFilter(this.transactionTypes.filter(x => !x.isSelected));
  }

  userItems(): TrxTypeViewModel[] {
    return this.applyFilter(this.transactionTypes.filter(x => x.isSelected));
  }

  removeToast(toast: PageToast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  private highlight(id: number) {
    this.highlightedId = id;
    clearTimeout(this.highlightTimer);
    this.highlightTimer = setTimeout(() => this.highlightedId = undefined, 2500);
  }

  private loadTypes() {
    this.apiService.getAllTransactionTypes().subscribe({
      next: res => {
        this.transactionTypes = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Unable to load transaction types.', true);
      }
    });
  }

  private applyFilter(items: TrxTypeViewModel[]): TrxTypeViewModel[] {
    const term = this.filter.trim().toLowerCase();
    if (!term) {
      return items;
    }
    return items.filter(x =>
      (x.name ?? '').toLowerCase().includes(term) || (x.description ?? '').toLowerCase().includes(term));
  }

  private showToast(message: string, isError = false) {
    this.toasts.push({ message, isError });
  }

  private updateReloadedTrxType(trxType: TrxTypeViewModel) {
    const index = this.transactionTypes.findIndex(tr => tr.id === trxType.id);
    if (index !== -1) {
      this.transactionTypes[index] = trxType;
    }
  }

}
