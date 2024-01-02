import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  constructor() { }

  ngOnInit(): void {
  }

}
