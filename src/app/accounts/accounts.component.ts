import { Component, OnDestroy, OnInit } from '@angular/core';
import { DragGridItem, DragGridPosition } from '../draggable-grid/model';
import { AccountViewApiService } from '../services/account-view-api.service';
import { AccountViewModel, SubAccountViewModel } from '../services/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountsGroupsComponent } from './accounts-groups/accounts-groups.component';
import {
  NavBarMenusIds,
  NavBarServiceService,
} from '../services/main-nav-bar/nav-bar-service.service';
import { AccountViewModelService } from '../services/account-view-model.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface AccountTreeItem extends DragGridItem {
  account: AccountViewModel;
  otherGroupSubAccounts: SubAccountViewModel[];
}

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css'],
})
export class AccountsComponent implements OnInit, OnDestroy {
  accountGroupId: number | null = null;
  dragGridItems: AccountTreeItem[] | null = null;
  private expandedIds: Set<number> = new Set();
  originalPositions: DragGridPosition[] | null = null;
  currentPositions: DragGridPosition[] | null = null;
  canSavePositions: boolean = false;
  initalLoad: boolean = true;
  menuSub: Subscription;

  constructor(
    public viewModel: AccountViewModelService,
    private apiService: AccountViewApiService,
    private modalService: NgbModal,
    private menuService: NavBarServiceService,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  ngOnDestroy(): void {
    this.menuSub.unsubscribe();
  }

  ngOnInit(): void {
    console.log('ngOnInit');
    if (this.initalLoad) {
      console.log('Initial Load');
      this.initalLoad = false;
      this.menuSub = this.menuService
        .getSubMenuEvents(
          NavBarMenusIds.ACCOUNT_GROUPS,
          NavBarMenusIds.NEW_ACCOUNT
        )
        .subscribe((res) => {
          if (res === NavBarMenusIds.ACCOUNT_GROUPS) {
            console.log('openAccountGroupsModal');
            this.openAccountGroupsModal();
          } else if (res === NavBarMenusIds.NEW_ACCOUNT) {
            this.router.navigate(['accounts/new'], { queryParams: { accountGroupId: this.accountGroupId } });
          }
        });

      this.route.queryParams.subscribe(params => {
        if (!this.accountGroupId) {
          const accountGroupId = Number.parseInt(params['accountGroupId']);
          this.loadMainData(accountGroupId);
        }
      });
    }
  }

  openAccountGroupsModal() {
    const modalRef = this.modalService.open(AccountsGroupsComponent, {
      backdrop: 'static',
      keyboard: false,
      size: 'md',
    });
    modalRef.componentInstance.accountGroups = this.viewModel.accountGroups;
  }

  onSavePositions() {
    if (this.currentPositions) {
      this.apiService.savePositions(this.currentPositions).subscribe((res) => {
        this.apiService
          .getAccountsByAccountGroup(this.accountGroupId)
          .subscribe((res) => {
            this.setDraggableGridAccounts(res);
            this.updateSavePositionsStatus();
          });
      });
    }
  }

  onAccountGroupChanged(event: any) {
    this.apiService
      .getAccountsByAccountGroup(this.accountGroupId)
      .subscribe((res) => {
        this.setDraggableGridAccounts(res);
        this.router.navigate([], { relativeTo: this.route, queryParams: { accountGroupId: this.accountGroupId } });
      });
  }

  onPositionsChanged(items: DragGridPosition[] | null) {
    this.currentPositions = items;
    this.updateSavePositionsStatus();
  }

  onItemClick(item: DragGridItem) {
    console.log('Item Clicked', item);
  }

  onDeleteClick(account: AccountViewModel) {
    const subAccountsCount = account.subAccounts?.length ?? 0;
    const message = subAccountsCount > 0
      ? `This account has ${subAccountsCount} sub-account(s) — they will become top-level accounts. Are you sure you want to delete it?`
      : 'Are you sure you want to delete this item?';
    if (confirm(message)) {
      this.apiService.deleteAccount(account.accountId).subscribe((res) => {
        this.loadMainData(this.accountGroupId);
      });
    }
  }

  onEditClick(accountId: number) {
    this.router.navigate([`accounts/edit/${accountId}`]);
  }

  onAddChildClick(parent: AccountViewModel) {
    this.router.navigate(['accounts/new'], {
      queryParams: {
        accountGroupId: this.accountGroupId,
        parentAccountId: parent.accountId,
        parentAccountName: parent.accountName,
      },
    });
  }

  toggleExpanded(accountId: number) {
    if (this.expandedIds.has(accountId)) {
      this.expandedIds.delete(accountId);
    } else {
      this.expandedIds.add(accountId);
    }
  }

  isExpanded(accountId: number): boolean {
    return this.expandedIds.has(accountId);
  }

  getGroupName(accountGroupId: number): string {
    return (
      this.viewModel.accountGroups.find((g) => g.accountGroupId === accountGroupId)
        ?.accountGroupName ?? 'another group'
    );
  }

  private updateSavePositionsStatus() {
    const items = this.currentPositions;
    if (
      items === null ||
      this.originalPositions === null ||
      items.length < 1 ||
      this.originalPositions.length < 1 ||
      items.length != this.originalPositions.length
    ) {
      this.canSavePositions = false;
      return;
    }

    for (let newPosition of items) {
      const oldPosition = this.originalPositions.find(
        (o) => o.id === newPosition.id
      );
      if (oldPosition?.position !== newPosition.position) {
        this.canSavePositions = true;
        return;
      }
    }

    this.canSavePositions = false;
  }

  private loadMainData(accountGroupId: number | null) {
    this.apiService.getMainViewModel(this.accountGroupId).subscribe((res) => {
      this.viewModel.accountGroups = res.accountGroupViewModels;
      if (!accountGroupId) {
        this.accountGroupId =
          !this.accountGroupId && this.viewModel.accountGroups.length > 0
            ? this.viewModel.accountGroups[0].accountGroupId
            : null;
      }
      else {
        this.accountGroupId = accountGroupId;
      }
      this.setDraggableGridAccounts(res.accountDetailsViewModels);
    });
  }

  private setDraggableGridAccounts(items: AccountViewModel[]) {
    if (items) {
      this.fixEmptyPositions(items);
      // Every account in the response belongs to the selected group, so each
      // gets its own (reorderable) card. A root's nested list only needs the
      // sub-accounts that live in *other* groups; same-group ones already
      // have their own card here.
      this.dragGridItems = items
        .sort((a, b) => a.accountPosition - b.accountPosition)
        .map((a) => {
          return {
            id: a.accountId,
            name: a.accountName,
            account: a,
            otherGroupSubAccounts: (a.subAccounts ?? []).filter(
              (s) => s.accountGroupId !== this.accountGroupId
            ),
          };
        });
      this.expandedIds = new Set();
    } else {
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
          position: position++,
        });
      }
    } else {
      this.originalPositions = null;
    }
  }

  private fixEmptyPositions(items: AccountViewModel[]) {
    if (items) {
      if (items.every((i) => i.accountPosition && i.accountPosition > 0)) {
        //all good
      } else {
        for (let i = 0; i < items.length; i++) {
          items[i].accountPosition = i + 1;
        }
      }
    }
  }
}
