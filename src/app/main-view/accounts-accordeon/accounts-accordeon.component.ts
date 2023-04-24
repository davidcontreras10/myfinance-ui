import { Component, OnInit } from '@angular/core';
import { AccountGroup } from '../models';

@Component({
  selector: 'app-accounts-accordeon',
  templateUrl: './accounts-accordeon.component.html',
  styleUrls: ['./accounts-accordeon.component.css']
})
export class AccountsAccordeonComponent implements OnInit {

  public groups: AccountGroup[] = [];
  public activeIds: string[] = [];

  constructor() { }

  ngOnInit(): void {
    for (let i = 0; i < 5; i++) {
      this.groups.push({
        accounts: [],
        id: i + 1,
        name: `Acc_${i + 1}`,
        isActive: i % 2 === 0
      });
    }

    this.activeIds = this.groups.filter(x => x.isActive).map(x => this.getIdPattern(x.id));
  }

  public getIdPattern(id: number) {
    return `acc_toggle_${id}`;
  }

}
