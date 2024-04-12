import { Component, OnInit } from '@angular/core';
import { TrxTypeServiceService } from '../services/trx-type-service.service';
import { TrxTypeViewModel } from '../services/models';
import { TextChangedArgs, TrxEventArgs } from './models';

@Component({
  selector: 'app-transaction-types',
  templateUrl: './transaction-types.component.html',
  styleUrls: ['./transaction-types.component.css']
})
export class TransactionTypesComponent implements OnInit {

  private transactionTypes: TrxTypeViewModel[] = [];

  constructor(private apiService: TrxTypeServiceService) { }

  ngOnInit(): void {
    this.apiService.getAllTransactionTypes().subscribe(res => {
      this.transactionTypes = res;
    })
  }

  onArrowChanged($event: TrxEventArgs) {
    const newIsSelected = !$event.trxType.isSelected;
    this.apiService.changeTrxTypeUserSelected($event.trxType.id, newIsSelected).subscribe(res => {
      if (res && res.length > 0) {
        $event.trxType.isSelected = newIsSelected;
      }
    })
  }

  onDeleted($event: TrxEventArgs) {

  }

  onTextChanged($event: TextChangedArgs) {
    const requestModel = {
      isSelected: $event.trxType.isSelected,
      spendTypeDescription: $event.trxType.description,
      spendTypeId: $event.trxType.id,
      spendTypeName: $event.trxType.name
    };

    if ($event.isNameField) {
      requestModel.spendTypeName = $event.newValue;
    }
    else {
      requestModel.spendTypeDescription = $event.newValue;
    }
    this.apiService.editTrxTrype(requestModel).subscribe(res => {
      this.updateReloadedTrxType(res);
    })
  }

  allItems(): TrxTypeViewModel[] {
    return this.transactionTypes.filter(x => !x.isSelected);;
  }

  userItems(): TrxTypeViewModel[] {
    return this.transactionTypes.filter(x => x.isSelected);
  }

  private updateReloadedTrxType(trxType: TrxTypeViewModel) {
    const index = this.transactionTypes.findIndex(tr => tr.id === trxType.id);
    if (index !== -1) {
      this.transactionTypes[index] = trxType;
    }
  }

}
