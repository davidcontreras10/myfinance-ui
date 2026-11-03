import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TrxTypeViewModel } from 'src/app/services/models';
import { EditedArgs, TrxEventArgs } from '../models';

@Component({
  standalone: false,
  selector: 'app-transaction-types-table',
  templateUrl: './transaction-types-table.component.html',
  styleUrls: ['./transaction-types-table.component.css']
})
export class TransactionTypesTableComponent implements OnInit, OnChanges {

  @Input()
  transactionTypes: TrxTypeViewModel[] = [];

  @Input()
  myTable: boolean;

  @Input()
  loading = false;

  @Input()
  busyIds: ReadonlySet<number> = new Set<number>();

  @Input()
  emptyMessage = 'No transaction types.';

  /** Id of the row that was just moved here; it is highlighted and scrolled into view. */
  @Input()
  highlightedId?: number;

  @Output()
  edited = new EventEmitter<EditedArgs>();

  @Output()
  deletedTrx = new EventEmitter<TrxEventArgs>();

  @Output()
  arrowClicked = new EventEmitter<TrxEventArgs>();

  editingId?: number;
  draftName = '';
  draftDescription = '';

  constructor(private host: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['highlightedId'] && this.highlightedId !== undefined) {
      const id = this.highlightedId;
      // Wait for the row to be rendered; only the destination list contains it
      setTimeout(() => {
        this.host.nativeElement.querySelector(`[data-trx-id="${id}"]`)
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    }
  }

  get nameIsBlank(): boolean {
    return this.draftName.trim().length === 0;
  }

  onArrowClicked(trxTypeElement: TrxTypeViewModel) {
    this.arrowClicked.emit({
      trxType: trxTypeElement
    });
  }

  onDeleteClicked(trxTypeElement: TrxTypeViewModel) {
    this.deletedTrx.emit({
      trxType: trxTypeElement
    });
  }

  startEdit(trxType: TrxTypeViewModel, focusField: 'name' | 'description' = 'name') {
    this.editingId = trxType.id;
    this.draftName = trxType.name ?? '';
    this.draftDescription = trxType.description ?? '';
    setTimeout(() => {
      this.host.nativeElement
        .querySelector<HTMLInputElement>(`[data-trx-id="${trxType.id}"] input[data-field="${focusField}"]`)
        ?.focus();
    });
  }

  cancelEdit() {
    this.editingId = undefined;
  }

  saveEdit(trxType: TrxTypeViewModel) {
    if (this.nameIsBlank) {
      return;
    }

    const name = this.draftName.trim();
    const description = this.draftDescription.trim();
    this.editingId = undefined;
    if (name !== (trxType.name ?? '') || description !== (trxType.description ?? '')) {
      this.edited.emit({ trxType, name, description });
    }
  }

}
