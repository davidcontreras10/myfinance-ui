import { Component, OnInit } from '@angular/core';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-debt-manager',
  templateUrl: './debt-manager.component.html',
  styleUrls: ['./debt-manager.component.css']
})
export class DebtManagerComponent implements OnInit {

  active = 0;

  constructor() { }

  ngOnInit(): void {
  }
}
