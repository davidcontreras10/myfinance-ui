import { Component, Injectable, Input, OnInit } from '@angular/core';
import { AccRow, AccountGroup, AccountGroupAccount } from '../models';

const ACCOUNTS_PER_ROW = 2;

@Component({
  selector: 'app-acc-group',
  templateUrl: './acc-group.component.html',
  styleUrls: ['./acc-group.component.css']
})
export class AccGroupComponent implements OnInit {

  @Input()
  accountGroup?: AccountGroup
  columnClass = `col-md-${12 / ACCOUNTS_PER_ROW}`


  constructor() { }

  ngOnInit(): void {
  }

  get accountRows(): AccRow[] {
    const rows: AccRow[] = [];
    if (this.accountGroup?.accounts) {
      for (let i = 0; i < this.accountGroup.accounts.length; i++) {
        let account = this.accountGroup.accounts[i];
        let currentRow: AccRow;
        if (rows.length === 0) {
          currentRow = this.getEmptyAccountGroupArray();
          rows.push(currentRow);
        }
        else {
          const lastRow = rows.at(-1);
          if (lastRow && lastRow.accounts.length < ACCOUNTS_PER_ROW) {
            currentRow = lastRow;
          }
          else {
            currentRow = this.getEmptyAccountGroupArray();
            rows.push(currentRow);
          }
        }

        if (currentRow) {
          currentRow.accounts.push(account)
        }
      }
    }
    return rows;
  }

  private getEmptyAccountGroupArray(): AccRow {
    let emptyArray: AccountGroupAccount[] = [];
    return {
      accounts: emptyArray
    };
  }
}
