import { Component, Injectable, Input, OnInit } from '@angular/core';
import { AccRow, AccountGroup } from '../models';

const ACCOUNTS_PER_ROW = 2;

@Component({
  selector: 'app-acc-group',
  templateUrl: './acc-group.component.html',
  styleUrls: ['./acc-group.component.css']
})
export class AccGroupComponent implements OnInit {

  @Input()
  accountGroup?: AccountGroup

  constructor() { }

  ngOnInit(): void {
    const orderedRows = this.accountRows;
  }

  get accountRows(): AccRow[] {
    const rows: AccRow[] = [];
    if (this.accountGroup?.accounts) {
      for (let i = 0; i < this.accountGroup.accounts.length; i++) {
        let row = new AccRow();
        let account = this.accountGroup.accounts[i];
        while (row.accounts.length < ACCOUNTS_PER_ROW) {
          row.accounts.push(account);
        }

        rows.push(row);
      }
    }
    return rows;
  }
}
