import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { DebtManagerApiService } from 'src/app/services/debt-manager-api.service';
import { AppUser, Currency, DebtRequestVm, NewDebtRequest } from 'src/app/services/models';

@Component({
  selector: 'app-new-debt-request',
  templateUrl: './new-debt-request.component.html',
  styleUrls: ['./new-debt-request.component.css']
})
export class NewDebtRequestComponent implements OnInit {

  @ViewChild('f') form: any;
  @Output() cancelRequested = new EventEmitter<void>();
  @Output() debtRequestSubmitted = new EventEmitter<DebtRequestVm>();

  supportedCurrencies: Currency[];
  supportedUsers: AppUser[];
  selectedCurrencyId: number;
  selectedDebtorId: string;
  eventDate: string;


  constructor(private service: DebtManagerApiService) {

  }

  ngOnInit(): void {
    this.eventDate = new Date().toISOString().split('T')[0];
    this.service.getDataToAddDebtRequest().subscribe(data => {
      this.supportedCurrencies = data.supportedCurrencies;
      this.supportedUsers = data.supportedUsers;
    });

  }

  onSubmit(submitValue: any) {
    const model = this.GetModel();
    if (model) {
      console.log('submitting', model);
      this.service.submitDebtRequest(model).subscribe(data => {
        this.debtRequestSubmitted.emit(data);
      });
    }
  }

  onCancel() {
    this.cancelRequested.emit();
  }

  private GetModel(): NewDebtRequest | null {
    if (!this.form.valid) {
      return null;
    }
    return {
      amount: this.form.value.amount,
      currencyId: this.selectedCurrencyId,
      targetUserId: this.selectedDebtorId,
      eventDate: new Date(this.eventDate),
      eventDescription: this.form.value.description,
      eventName: this.form.value.name
    }
  }

}
