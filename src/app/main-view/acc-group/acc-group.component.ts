import { Component, Injectable, Input, OnInit } from '@angular/core';
import { AccountGroup } from '../models';

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
  }

}
