import { Component, OnInit } from '@angular/core';
import { TrxTypeServiceService } from '../services/trx-type-service.service';
import { TrxTypeViewModel } from '../services/models';
import { TextCangedArgs } from './models';

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

  onTextChanged($event: TextCangedArgs) {
    if ($event.isNameField) {
      $event.trxType.name = $event.newValue + 'edited'
    }
    else {
      $event.trxType.description = $event.newValue + 'edited'
    }
  }

  allItems(): TrxTypeViewModel[] {
    return this.transactionTypes.filter(x => !x.isSelected);;
  }

  userItems(): TrxTypeViewModel[] {
    return this.transactionTypes.filter(x => x.isSelected);
  }

}
