import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-nav-bar',
  templateUrl: './main-nav-bar.component.html',
  styleUrls: ['./main-nav-bar.component.css']
})
export class MainNavBarComponent implements OnInit {
  isMainCollapsed = true;
  isDropDown1Collapsed = true;
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  public toggleCollapse() {
    this.isMainCollapsed = !this.isMainCollapsed;
  }

  public navbar1DropdownClick() {
    this.isDropDown1Collapsed = !this.isDropDown1Collapsed;
  }

  @HostListener('document:click', ['$event'])
  clickout() {
    this.isDropDown1Collapsed = true;
  }

}
