import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AddNewAccountModels, BasicAccountIncluded } from '../services/models';
import { AccountViewApiService } from '../services/account-view-api.service';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.css']
})
export class NewAccountComponent implements OnInit {

  viewModel: AddNewAccountModels;
  selectedParentAccs: BasicAccountIncluded[] = [];

  constructor(private apiService: AccountViewApiService) { }

  ngOnInit(): void {
    this.apiService.getAddAccountViewModel().subscribe(res => {
      this.viewModel = res;
    })
  }

  submit(_t5: NgForm) {
    throw new Error('Method not implemented.');
  }

  getIncludedAccounts(): BasicAccountIncluded[] {
    return this.viewModel.accountIncludeViewModels.filter(vm => this.selectedParentAccs.every(s => s.id !== vm.id));
  }
}
