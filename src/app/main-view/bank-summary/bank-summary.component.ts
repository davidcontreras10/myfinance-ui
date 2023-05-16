import { Component, Input, OnInit } from '@angular/core';
import { MainViewModel } from '../main-view-model';

@Component({
  selector: 'app-bank-summary',
  templateUrl: './bank-summary.component.html',
  styleUrls: ['./bank-summary.component.css']
})
export class BankSummaryComponent implements OnInit {

  @Input() bankSummaryloading = false;

  constructor(public mainViewModel: MainViewModel) { }

  ngOnInit(): void {
  }

}
