import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { NavMenuItem } from '../models';

@Component({
  selector: 'app-nav-bar-menu',
  templateUrl: './nav-bar-menu.component.html',
  styleUrls: ['./nav-bar-menu.component.css']
})
export class NavBarMenuComponent implements OnInit {

  @Input()
  public menuItem: NavMenuItem | undefined;

  @Output()
  inactiveMenuClicked = new EventEmitter<NavMenuItem>();

  public showSubmenus: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  public subMenuClick() {
    this.showSubmenus = !this.showSubmenus;
  }

  public onInactiveMenuClicked() {
    this.inactiveMenuClicked.emit(this.menuItem);
  }

  @HostListener('document:click', ['$event'])
  clickout() {
    this.showSubmenus = false;
  }

}
