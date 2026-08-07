import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NavMenuItem, SubMenu } from './models';
import { AuthService } from '../auth.service';
import { NavBarMenusIds } from '../services/main-nav-bar/nav-bar-service.service';
import { PERIOD_DATE_QUERY_PARAM } from '../main-view/main-view.constants';

@Component({
  selector: 'app-main-nav-bar',
  templateUrl: './main-nav-bar.component.html',
  styleUrls: ['./main-nav-bar.component.css']
})
export class MainNavBarComponent implements OnInit {
  public items: NavMenuItem[] = [];
  isMainCollapsed = true;

  private financeMenuItem: NavMenuItem;
  private financeBaseSubMenus: SubMenu[] = [
    { id: 'toggle-summary', name: 'Toggle Summary' },
    { id: NavBarMenusIds.MAIN_VIEW_PREFS, name: 'Preferences' },
    { id: NavBarMenusIds.SET_PERIODS_DATE, name: 'Set Periods Date' },
    { id: NavBarMenusIds.UPLOAD_SCOT_TRX_FILE, name: 'Upload Scotiabank File' },
    { id: NavBarMenusIds.DEBT_MANAGER, name: 'Debt Manager' }
  ];

  constructor(private router: Router, private authService: AuthService) {
    this.financeMenuItem = {
      isActive: false, name: 'Finance', subMenus: [...this.financeBaseSubMenus],
      routingLink: '/finance',
      routingRegexPattern: /^\/finance(\?.*)?$/
    };
    this.items = [
      { isActive: false, name: 'Home', routingLink: '/' },
      this.financeMenuItem,
      {
        isActive: false, name: 'Accounts', routingLink: '/accounts', subMenus: [
          { id: NavBarMenusIds.ACCOUNT_GROUPS, name: 'Manager Account Groups' },
          { id: NavBarMenusIds.NEW_ACCOUNT, name: 'New Account...' }
        ],
        routingRegexPattern: /^\/accounts(\?.*)?$/
      },
      { isActive: false, name: 'Scheduled Tasks', routingLink: '/scheduled-tasks' },
      { isActive: false, name: 'Bank Transactions', routingLink: '/bank-trx', routingRegexPattern: /^\/bank-trx(\?.*)?$/ },
      {
        isActive: false, name: 'Transaction Types', routingLink: '/transaction-types', subMenus: [
          { id: NavBarMenusIds.NEW_TRX_TYPE, name: 'New Transaction type...' }
        ],
      },
      { isActive: false, name: 'Debt Manager', routingLink: '/debt-manager' },
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
    this.updateFinanceSubMenus(event.url);
  }

  private updateFinanceSubMenus(url: string) {
    const hasPeriodDate = !!this.router.parseUrl(url).queryParams[PERIOD_DATE_QUERY_PARAM];
    this.financeMenuItem.subMenus = hasPeriodDate
      ? [...this.financeBaseSubMenus, { id: NavBarMenusIds.CLEAR_PERIODS_DATE, name: 'Clear Period Date' }]
      : [...this.financeBaseSubMenus];
  }

  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  public toggleCollapse() {
    this.isMainCollapsed = !this.isMainCollapsed;
  }
}
