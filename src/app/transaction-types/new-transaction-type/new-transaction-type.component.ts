import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TrxTypeServiceService } from 'src/app/services/trx-type-service.service';

@Component({
  selector: 'app-new-transaction-type',
  templateUrl: './new-transaction-type.component.html',
  styleUrls: ['./new-transaction-type.component.css']
})
export class NewTransactionTypeComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private apiService: TrxTypeServiceService) { }

  ngOnInit(): void {
  }

  submit(form: NgForm) {
    form.value.isSelected = !!form.value.isSelected;
    this.apiService.newTrxType({
      isSelected: form.value.isSelected,
      spendTypeDescription: form.value.spendTypeDescription,
      spendTypeName: form.value.spendTypeName
    }).subscribe(res => {
      this.activeModal.close({
        value: res,
        success: true
      })
    })
  }

}
