import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountViewApiService } from 'src/app/services/account-view-api.service';
import { AccountViewModelService } from 'src/app/services/account-view-model.service';
import { AccGroupViewModel, AccountGroupRequest } from 'src/app/services/models';

@Component({
  selector: 'app-accounts-groups',
  templateUrl: './accounts-groups.component.html',
  styleUrls: ['./accounts-groups.component.css']
})
export class AccountsGroupsComponent implements OnInit {

  @Input()
  minPosition: number = 1;
  selected: AccGroupViewModel | null;

  constructor(public activeModal: NgbActiveModal, public viewModel: AccountViewModelService, private service: AccountViewApiService) { }

  submit(form: NgForm) {
    if (form.valid) {
      const model = this.getFormModel(form);
      if (model) {
        if (this.selected) {
          this.service.updateAccountGroup(model, this.selected.accountGroupId).subscribe(res => {
            this.onAccoutnGroupProcessed(res);
          })
        }
        else {
          this.service.createNewAccountGroup(model).subscribe(res => {
            this.onAccoutnGroupProcessed(res);
          })
        }
      }
    }
  }

  ngOnInit(): void {
    console.log('accountGroups', this.viewModel.accountGroups);
  }

  getPlaceholder(): string {
    return `From ${this.minPosition} to ${this.viewModel.accountGroups?.length + 1}`
  }

  private onAccoutnGroupProcessed(id: number) {
    const accountGroupId = id > 0 ? id : this.selected?.accountGroupId;
    if (accountGroupId && accountGroupId > 0) {
      this.service.getAccountGroupById(accountGroupId).subscribe(res => {
        this.viewModel.upsertAccountGroup(res);
        this.activeModal.close('Submit');
      })
    }
  }

  private getFormModel(form: NgForm): AccountGroupRequest | null {
    if (form.valid) {
      return {
        accountGroupName: form.value.name,
        accountGroupPosition: form.value.position,
        accountGroupDisplayValue: form.value.displayValue,
        displayDefault: form.value.showDefault ? true : false
      }
    }

    return null;
  }
}
