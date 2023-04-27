import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { NavMenuItem } from '../models';
import { NavBarServiceService } from 'src/app/services/main-nav-bar/nav-bar-service.service';

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

  constructor(private navBarService: NavBarServiceService) { }

  ngOnInit(): void {
  }

  public subMenuHeaderClick() {
    this.showSubmenus = !this.showSubmenus;
  }

  public onInactiveMenuClicked() {
    this.inactiveMenuClicked.emit(this.menuItem);
  }

  public subMenuItemClicked(subMenu: string){
    this.navBarService.emitSubMenuEvent(subMenu);
  }

  public clickedOutside(){
    this.showSubmenus = false;
  }
}
