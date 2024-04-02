import { Component, OnInit } from '@angular/core';
import { TrxTypeServiceService } from '../services/trx-type-service.service';
import { TrxTypeViewModel } from '../services/models';

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

  onTextChanged($event: FocusEvent, trxTypeElement: TrxTypeViewModel, isNameField: boolean) {
    const element = $event.target as HTMLElement;
    if (element) {
      const fieldValue = isNameField ? trxTypeElement.name : trxTypeElement.description;
      if (fieldValue !== element.innerText) {
        console.log('Should change value', element.innerText);
      }
    }
  }
  allItems(): TrxTypeViewModel[] {
    return this.transactionTypes.filter(x => !x.isSelected);;
  }

  userItems(): TrxTypeViewModel[] {
    return this.transactionTypes.filter(x => x.isSelected);
  }

}
