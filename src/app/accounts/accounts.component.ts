import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { DragGridItem, DragGridPosition } from '../draggable-grid/model';
import { AccountViewService } from '../services/account-view.service';
import { AccGroupViewModel, AccountViewModel } from '../services/models';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {

  accountGroupId: number | null = null;
  accountGroups: AccGroupViewModel[];
  dragGridItems: DragGridItem[] | null = null;

  constructor(private apiService: AccountViewService) { }

  ngOnInit(): void {
    this.loadMainData();
  }

  onAccountGroupChanged(event: any) {
    console.log("onAccountGroupChanged", event);
  }

  onPositionsChanged(items: DragGridPosition[] | null) {
    console.log('New items:', items);
  }

  onItemClick(item: DragGridItem) {
    console.log('Item Clicked', item);
  }

  private loadMainData() {
    this.apiService.getMainViewModel(this.accountGroupId).subscribe(res => {
      this.accountGroups = res.accountGroupViewModels;
      this.setDraggableGridAccounts(res.accountDetailsViewModels);
    });
  }

  private setDraggableGridAccounts(items: AccountViewModel[]) {
    if (items) {
      this.dragGridItems = items
        .sort((a, b) => a.accountPosition - b.accountPosition)
        .map(i => {
          return {
            id: i.accountId,
            name: i.accountName
          }
        })
    }

    else {
      this.dragGridItems = null;
    }
  }
}