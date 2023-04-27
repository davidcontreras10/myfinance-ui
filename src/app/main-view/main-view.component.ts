import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { NavBarServiceService } from '../services/main-nav-bar/nav-bar-service.service';
import { AccountGroup } from './models';
import { MainViewApiService } from '../services/main-view-api.service';
import { MainViewModel } from './main-view-model';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css'],
  providers: [AuthGuard]
})
export class MainViewComponent implements OnInit {
  public groups: AccountGroup[] = [];

  constructor(navBarService: NavBarServiceService, private mainViewApiService: MainViewApiService, public mainViewModel: MainViewModel) {
    navBarService.getSubMenuEvents('banks').subscribe((value) => {
      this.handleIncomingNavBarAction(value);
    });
  }

  ngOnInit(): void {
    this.mainViewApiService.loadMainAccountGroups().subscribe((response => {
      this.groups = response.sort((a, b) => a.accountGroupPosition > b.accountGroupPosition ? 1 : -1);
      this.mainViewModel.activeIds = this.groups.filter(x => x.isSelected).map(x => MainViewModel.getAccountGroupIdPattern(x.id));
      this.mainViewModel.updateData(this.groups);
      const perioIds = this.mainViewModel.getAllSelectedPeriodIds();
      this.mainViewApiService.loadAccountFinanance(perioIds, true).subscribe(res => {
        this.mainViewModel.updateFinanceInfo(res);
      })
    }))
  }

  private handleIncomingNavBarAction(action: string) {

  }
}
