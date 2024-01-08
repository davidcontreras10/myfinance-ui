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
  originalPositions: DragGridPosition[] | null = null;
  currentPositions: DragGridPosition[] | null = null;
  canSavePositions: boolean = false;

  constructor(private apiService: AccountViewService) { }

  ngOnInit(): void {
    this.loadMainData();
  }

  onSavePositions() {
    if (this.currentPositions) {
      this.apiService.savePositions(this.currentPositions).subscribe(res => {
        this.apiService.getAccountsByAccountGroup(this.accountGroupId).subscribe(res => {
          this.setDraggableGridAccounts(res);
          this.updateSavePositionsStatus();
        })
      })
    }
  }

  onAccountGroupChanged(event: any) {
    this.apiService.getAccountsByAccountGroup(this.accountGroupId).subscribe(res => {
      this.setDraggableGridAccounts(res);
    })
  }

  onPositionsChanged(items: DragGridPosition[] | null) {
    this.currentPositions = items;
    this.updateSavePositionsStatus();
  }

  onItemClick(item: DragGridItem) {
    console.log('Item Clicked', item);
  }

  private updateSavePositionsStatus() {
    const items = this.currentPositions;
    if (items === null || this.originalPositions === null
      || items.length < 1 || this.originalPositions.length < 1
      || items.length != this.originalPositions.length) {
      this.canSavePositions = false;
      return;
    }

    for (let newPosition of items) {
      const oldPosition = this.originalPositions.find(o => o.id === newPosition.id);
      if (oldPosition?.position !== newPosition.position) {
        this.canSavePositions = true;
        return;
      }
    }

    this.canSavePositions = false;
    console.log('Can seve pos:', this.canSavePositions);
  }

  private loadMainData() {
    this.apiService.getMainViewModel(this.accountGroupId).subscribe(res => {
      this.accountGroups = res.accountGroupViewModels;
      this.accountGroupId = !this.accountGroupId && this.accountGroups.length > 0 ? this.accountGroups[0].accountGroupId : null;
      this.setDraggableGridAccounts(res.accountDetailsViewModels);
    });
  }

  private setDraggableGridAccounts(items: AccountViewModel[]) {
    if (items) {
      this.fixEmptyPositions(items);
      console.log('New accs:', items.map(i => {
        return {
          id: i.accountId, pos: i.accountPosition
        }
      }));
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

    this.updateCurrentOriginalPositions();
  }

  private updateCurrentOriginalPositions() {
    if (this.dragGridItems) {
      this.originalPositions = [];
      let position = 1;
      for (let item of this.dragGridItems) {
        this.originalPositions.push({
          id: item.id,
          position: position++
        });
      }
    }
    else {
      this.originalPositions = null;
    }
  }

  private fixEmptyPositions(items: AccountViewModel[]) {
    if (items) {
      if (items.every(i => i.accountPosition && i.accountPosition > 0)) {
        //all good
      }
      else {
        for (let i = 0; i < items.length; i++) {
          items[i].accountPosition = i + 1;
        }
      }
    }
  }
}