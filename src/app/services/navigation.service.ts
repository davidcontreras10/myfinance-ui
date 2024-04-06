import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private history: string[] = [];

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.url);
      }
    });
  }

  goBack(defaultNavigation: any[], extras?: NavigationExtras): void {
    if (this.history.length > 1) {
      this.history.pop(); // Current route
      const previousUrl = this.history.pop(); // Previous route
      if (previousUrl) {
        this.router.navigateByUrl(previousUrl);
      }
    } else {
      this.router.navigate(defaultNavigation, extras);
    }
  }
}
