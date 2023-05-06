import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionViewModel } from '../models';
import { MainViewApiService } from 'src/app/services/main-view-api.service';
import { NgForm } from '@angular/forms';
import { MainViewModel } from '../main-view-model';

const PATCH_MAPS = [
  {
    name: "spendType",
    propName: "spendTypeId",
    propValue: 5
  },
  {
    name: "description",
    propName: "description",
    propValue: 4
  }
]

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

  constructor(public activeModal: NgbActiveModal, private mainViewApiService: MainViewApiService, private mainViewModel: MainViewModel) { }

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

  submit(f: NgForm) {
    const modifieds = Object.entries(f.controls).filter(([key, value]) => !value.pristine);
    if (modifieds && modifieds.length > 0) {
      let basePatch: { [key: string]: any } = {
        spendId: this.spendId,
        modifyList: [] = []
      }

      modifieds.forEach(md => {
        const patchMap = PATCH_MAPS.find(p => p.name === md[0]);
        if (patchMap) {
          basePatch[patchMap.propName] = md[1].value;
          basePatch['modifyList'].push(patchMap.propValue);
        }
      })

      this.mainViewApiService.updateSpend(this.spendId, basePatch).subscribe(res => {
        this.mainViewModel.notifyAccountsModified(res);
        this.activeModal.close('Submit');
      })
    }
  }

}
