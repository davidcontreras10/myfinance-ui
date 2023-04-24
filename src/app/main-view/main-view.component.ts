import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { NavBarServiceService } from '../services/main-nav-bar/nav-bar-service.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css'],
  providers: [AuthGuard]
})
export class MainViewComponent implements OnInit {

  constructor(navBarService: NavBarServiceService) {
    navBarService.getSubMenuEvents('banks').subscribe(this.handleIncomingNavBarAction);
  }

  ngOnInit(): void {
  }

  private handleIncomingNavBarAction(action: string) {
  }
}
