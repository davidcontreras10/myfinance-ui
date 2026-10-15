import { Component, Input, OnInit } from '@angular/core';
import { AccountGroup } from '../models';
import { MainViewModel } from '../main-view-model';

@Component({
  standalone: false,
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

  public isActive(groupId: number): boolean {
    return this.mainViewModel.activeIds.includes(MainViewModel.getAccountGroupIdPattern(groupId));
  }

  public getAccountGroupIdPattern(value: number) {
    return MainViewModel.getAccountGroupIdPattern(value);
  }

}
