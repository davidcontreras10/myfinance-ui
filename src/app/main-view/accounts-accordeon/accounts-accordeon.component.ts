import { Component, Input, OnInit } from '@angular/core';
import { AccountGroup } from '../models';
import { MainViewModel } from '../main-view-model';

@Component({
  selector: 'app-accounts-accordeon',
  templateUrl: './accounts-accordeon.component.html',
  styleUrls: ['./accounts-accordeon.component.css']
})
export class AccountsAccordeonComponent implements OnInit {

  @Input()
  public groups: AccountGroup[] = [];

  constructor(public mainViewModel: MainViewModel) { }

  ngOnInit(): void {
  }

  public getAccountGroupIdPattern(value: number) {
    return MainViewModel.getAccountGroupIdPattern(value);
  }

}
