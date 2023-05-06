import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionViewModel } from '../models';
import { MainViewApiService } from 'src/app/services/main-view-api.service';

@Component({
  selector: 'app-view-trx',
  templateUrl: './view-trx.component.html',
  styleUrls: ['./view-trx.component.css']
})
export class ViewTrxComponent implements OnInit {

  @Input() accountPeriodId: number;
  @Input() spendId: number;

  public trxViewModel?: TransactionViewModel;
  public selectedSpendTypeId: number;

  constructor(public activeModal: NgbActiveModal, private mainViewApiService: MainViewApiService) { }

  ngOnInit(): void {
    if (this.accountPeriodId && this.spendId) {
      this.mainViewApiService.getViewTransactionModel(this.accountPeriodId, this.spendId).subscribe(item => {
        if (item) {
          this.updateModel(item);
        }
      });
    }
  }

  private updateModel(model: TransactionViewModel) {
    if (model) {
      this.trxViewModel = model;
      if (this.trxViewModel.selectedSpendTypeId) {
        this.selectedSpendTypeId = this.trxViewModel.selectedSpendTypeId
      }
    }
  }

  onPendingClick() {
    console.log('Pending click');
  }

}
