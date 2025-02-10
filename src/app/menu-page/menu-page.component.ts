import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu-page.component.html',
  styleUrls: ['./menu-page.component.css']
})
export class MenuPageComponent {

  constructor(private router: Router) { }

  onMenuClick(menuId: string) {
    console.log(`Menu clicked: ${menuId}`);
    this.router.navigate([menuId]);

  }
}
