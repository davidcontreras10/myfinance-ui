import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavMenuItem } from './models';

@Component({
  selector: 'app-main-nav-bar',
  templateUrl: './main-nav-bar.component.html',
  styleUrls: ['./main-nav-bar.component.css']
})
export class MainNavBarComponent implements OnInit {
  public items: NavMenuItem[] = [];
  isMainCollapsed = true;
  constructor(private router: Router) {
    this.items = [
      {
        isActive: true, name: 'Home', subMenus: [
          "Bank Summary"
        ]
      },
      { isActive: false, name: 'Accounts', routingLink: "accounts" }
    ]
  }

  ngOnInit(): void {
  }

  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  public toggleCollapse() {
    this.isMainCollapsed = !this.isMainCollapsed;
  }
}
