import { Component, Input, OnInit } from '@angular/core';
import { AccountGroup } from '../models';
import { MainViewServiceService } from 'src/app/services/main-view-service.service';

@Component({
  selector: 'app-accounts-accordeon',
  templateUrl: './accounts-accordeon.component.html',
  styleUrls: ['./accounts-accordeon.component.css']
})
export class AccountsAccordeonComponent implements OnInit {

  @Input()
  public groups: AccountGroup[] = [];
  public activeIds: string[] = [];

  constructor(private mainviewService: MainViewServiceService) { }

  ngOnInit(): void {
    this.mainviewService.loadMainAccountGroups().subscribe((response => {
      console.log(response);
      this.groups = response.sort((a, b) => a.accountGroupPosition > b.accountGroupPosition ? 1 : -1);
      this.activeIds = this.groups.filter(x => x.isSelected).map(x => this.getIdPattern(x.id));
    }))
  }

  public getIdPattern(id: number) {
    return `acc_toggle_${id}`;
  }

}
