import { Component, OnInit } from '@angular/core';
import { TrxTypeServiceService } from '../services/trx-type-service.service';
import { TrxTypeViewModel } from '../services/models';
import { NewTrxTypeDialogResult, TextChangedArgs, TrxEventArgs } from './models';
import { NavBarMenusIds, NavBarServiceService } from '../services/main-nav-bar/nav-bar-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewTransactionTypeComponent } from './new-transaction-type/new-transaction-type.component';

@Component({
  selector: 'app-transaction-types',
  templateUrl: './transaction-types.component.html',
  styleUrls: ['./transaction-types.component.css']
})
export class TransactionTypesComponent implements OnInit {

  private transactionTypes: TrxTypeViewModel[] = [];

  constructor(private apiService: TrxTypeServiceService, private menuService: NavBarServiceService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.menuService
      .getSubMenuEvents(
        NavBarMenusIds.NEW_TRX_TYPE
      ).subscribe((res) => {
        const modal = this.modalService.open(NewTransactionTypeComponent, { backdrop: true, size: 'lg' });
        modal.result.then((res) => {
          const result = <NewTrxTypeDialogResult>res;
          if (result.success && result.value) {
            this.transactionTypes.push(result.value);
          }
        })
      });

    this.apiService.getAllTransactionTypes().subscribe(res => {
      this.transactionTypes = res;
    });
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
    console.log('delete', $event);
    const trxType = $event.trxType;
    if (confirm(`Are you sure to delete Transaction type ${$event.trxType.name}`)) {
      this.apiService.deleteTrxType($event.trxType.id).subscribe({
        next: res => {
          const index = this.transactionTypes.findIndex(tr => tr.id === trxType.id);
          this.transactionTypes.splice(index, 1);
        },
        error: res => {
          alert('Unable to delete transaction type.');
        }
      })
    }
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
    this.apiService.editTrxType(requestModel).subscribe(res => {
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
