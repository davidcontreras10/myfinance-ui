import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NavMenuItem } from './models';
import { AuthService } from '../auth.service';
import { NavBarMenusIds } from '../services/main-nav-bar/nav-bar-service.service';

@Component({
  selector: 'app-main-nav-bar',
  templateUrl: './main-nav-bar.component.html',
  styleUrls: ['./main-nav-bar.component.css']
})
export class MainNavBarComponent implements OnInit {
  public items: NavMenuItem[] = [];
  isMainCollapsed = true;
  constructor(private router: Router, private authService: AuthService) {
    this.items = [
      {
        isActive: true, name: 'Home', subMenus: [
          { id: 'toggle-summary', name: 'Toggle Summary' },
          { id: NavBarMenusIds.MAIN_VIEW_PREFS, name: 'Preferences' },
          { id: NavBarMenusIds.SET_PERIODS_DATE, name: 'Set Periods Date' },
        ],
        routingLink: '/'
      },
      {
        isActive: false, name: 'Accounts', routingLink: '/accounts', subMenus: [
          { id: NavBarMenusIds.ACCOUNT_GROUPS, name: 'Manager Account Groups' },
          { id: NavBarMenusIds.NEW_ACCOUNT, name: 'New Account...' }
        ],
        routingRegexPattern: /^\/accounts(\?.*)?$/
      },
      { isActive: false, name: 'Scheduled Tasks', routingLink: '/scheduled-tasks' },
      {
        isActive: false, name: 'Transaction Types', routingLink: '/transaction-types', subMenus: [
          { id: NavBarMenusIds.NEW_TRX_TYPE, name: 'New Transaction type...' }
        ]
      }
    ];

    router.events.subscribe(value => {
      if (value instanceof NavigationStart) {
        this.onNavigationChanged(value);
      }
    })
  }


  public logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  ngOnInit(): void {
  }

  private onNavigationChanged(event: NavigationStart) {
    this.items.forEach(item => {
      item.isActive = event.url === item.routingLink || (!!item.routingRegexPattern && item.routingRegexPattern.test(event.url))
    })
  }

  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  public toggleCollapse() {
    this.isMainCollapsed = !this.isMainCollapsed;
  }
}
