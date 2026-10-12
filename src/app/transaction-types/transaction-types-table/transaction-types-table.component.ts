import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TrxTypeViewModel } from 'src/app/services/models';
import { TextChangedArgs, TrxEventArgs } from '../models';

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
  textChanged = new EventEmitter<TextChangedArgs>();

  @Output()
  deletedTrx = new EventEmitter<TrxEventArgs>();

  @Output()
  arrowClicked = new EventEmitter<TrxEventArgs>();

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

  onEnter($event: Event) {
    // Enter commits the edit (via blur) instead of inserting a line break
    $event.preventDefault();
    ($event.target as HTMLElement).blur();
  }

  onTextChanged($event: FocusEvent, trxTypeElement: TrxTypeViewModel, isNameField: boolean) {
    const element = $event.target as HTMLElement;
    if (element) {
      const fieldValue = (isNameField ? trxTypeElement.name : trxTypeElement.description) ?? '';
      if (fieldValue !== element.innerText) {
        this.textChanged.emit({
          isNameField: isNameField,
          newValue: element.innerText,
          trxType: trxTypeElement
        })
      }
    }
  }

}
