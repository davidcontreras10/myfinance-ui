import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { NavBarServiceService } from '../services/main-nav-bar/nav-bar-service.service';
import { AccountGroup } from './models';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css'],
  providers: [AuthGuard]
})
export class MainViewComponent implements OnInit {
  public groups: AccountGroup[] = [];

  constructor(navBarService: NavBarServiceService) {
    navBarService.getSubMenuEvents('banks').subscribe((value) => {
      this.handleIncomingNavBarAction(value);
    });
  }

  ngOnInit(): void {

  }

  private handleIncomingNavBarAction(action: string) {

  }
}
