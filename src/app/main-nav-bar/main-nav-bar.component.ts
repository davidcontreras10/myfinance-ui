import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NavMenuItem } from './models';
import { AuthService } from '../auth.service';

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
          { id: 'banks', name: 'Bank Summary' },
          { id: 'toggle-summary', name: 'Toggle Summary'}
        ],
        routingLink: '/'
      },
      { isActive: false, name: 'Accounts', routingLink: '/accounts' }
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
      item.isActive = event.url === item.routingLink
    })
  }

  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  public toggleCollapse() {
    this.isMainCollapsed = !this.isMainCollapsed;
  }
}
