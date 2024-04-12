import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TrxTypeViewModel } from 'src/app/services/models';
import { TextChangedArgs, TrxEventArgs } from '../models';

@Component({
  selector: 'app-transaction-types-table',
  templateUrl: './transaction-types-table.component.html',
  styleUrls: ['./transaction-types-table.component.css']
})
export class TransactionTypesTableComponent implements OnInit {

  @Input()
  transactionTypes: TrxTypeViewModel[] = [];

  @Input()
  myTable: boolean;

  @Output()
  textChanged = new EventEmitter<TextChangedArgs>();

  @Output()
  deletedTrx = new EventEmitter<TrxEventArgs>();

  @Output()
  arrowClicked = new EventEmitter<TrxEventArgs>();

  constructor() { }

  ngOnInit(): void {
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

  onTextChanged($event: FocusEvent, trxTypeElement: TrxTypeViewModel, isNameField: boolean) {
    const element = $event.target as HTMLElement;
    if (element) {
      const fieldValue = isNameField ? trxTypeElement.name : trxTypeElement.description;
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
