import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountViewApiService } from 'src/app/services/account-view-api.service';
import { AccountViewModelService } from 'src/app/services/account-view-model.service';
import { AccGroupViewModel, AccountGroupRequest } from 'src/app/services/models';
import { ToasterService } from 'src/app/services/toaster.service';

/**
 * Manages the user's account groups: their order (drag a row, or use the arrows), name, display name,
 * whether the Finance page opens the group expanded, and deleting empty groups. The modal stays open between
 * changes and closes with `true` when anything changed, so the Accounts page knows to refresh.
 *
 * The API treats the position as the group's final 1-based place and renumbers the others, so a move is one
 * update with the new index. After every change the list is reloaded, because other groups' positions move.
 */
@Component({
  standalone: false,
  selector: 'app-accounts-groups',
  templateUrl: './accounts-groups.component.html',
  styleUrls: ['./accounts-groups.component.css']
})
export class AccountsGroupsComponent implements OnInit {

  readonly minNameLength = 3;

  groups: AccGroupViewModel[] = [];
  /** The group being edited, or null while a new one is being filled in. */
  selectedId: number | null = null;
  name = '';
  displayValue = '';
  displayDefault = false;
  saving = false;
  errorMessage: string | null = null;
  status = '';
  changed = false;

  private displayValueEdited = false;

  constructor(
    public activeModal: NgbActiveModal,
    private viewModel: AccountViewModelService,
    private service: AccountViewApiService,
    private toaster: ToasterService
  ) { }

  ngOnInit(): void {
    this.groups = [...(this.viewModel.accountGroups ?? [])];
    this.select(this.groups[0] ?? null);
  }

  get isNew(): boolean {
    return this.selectedId === null;
  }

  get selected(): AccGroupViewModel | null {
    return this.groups.find(group => group.accountGroupId === this.selectedId) ?? null;
  }

  get selectedPosition(): number {
    return this.groups.findIndex(group => group.accountGroupId === this.selectedId) + 1;
  }

  get nameValid(): boolean {
    return this.name.trim().length >= this.minNameLength;
  }

  get displayValueValid(): boolean {
    return this.displayValue.trim().length >= this.minNameLength;
  }

  /** The editor differs from what is saved. A new group always counts as changed. */
  get dirty(): boolean {
    const group = this.selected;
    if (!group) {
      return true;
    }

    return this.name !== group.accountGroupName
      || this.displayValue !== group.accountGroupDisplayValue
      || this.displayDefault !== group.displayDefault;
  }

  get canSave(): boolean {
    return this.nameValid && this.displayValueValid && this.dirty && !this.saving;
  }

  get canDelete(): boolean {
    const group = this.selected;
    return !!group && group.accountCount === 0 && !this.saving;
  }

  /** Why Delete is unavailable, when the reason is that the group still has accounts. */
  get deleteHint(): string | null {
    const count = this.selected?.accountCount ?? 0;
    if (count === 0) {
      return null;
    }

    return `This group has ${count} account${count === 1 ? '' : 's'}. Move or delete ${count === 1 ? 'it' : 'them'} first.`;
  }

  select(group: AccGroupViewModel | null) {
    this.selectedId = group?.accountGroupId ?? null;
    this.name = group?.accountGroupName ?? '';
    this.displayValue = group?.accountGroupDisplayValue ?? '';
    this.displayDefault = group?.displayDefault ?? false;
    this.displayValueEdited = false;
    this.errorMessage = null;
  }

  startNew() {
    this.select(null);
  }

  /** A new group's display name follows its name until the display name is typed in by hand. */
  onNameChange(name: string) {
    if (this.isNew && !this.displayValueEdited) {
      this.displayValue = name;
    }
  }

  onDisplayValueChange() {
    this.displayValueEdited = true;
  }

  save() {
    if (!this.canSave) {
      return;
    }

    const creating = this.isNew;
    const request: AccountGroupRequest = {
      accountGroupName: this.name.trim(),
      accountGroupDisplayValue: this.displayValue.trim(),
      accountGroupPosition: creating ? this.groups.length + 1 : this.selectedPosition,
      displayDefault: this.displayDefault,
    };

    this.saving = true;
    this.errorMessage = null;
    const call = creating
      ? this.service.createNewAccountGroup(request)
      : this.service.updateAccountGroup(request, this.selectedId!);
    call.subscribe({
      next: (id) => {
        this.changed = true;
        this.toaster.success(creating ? 'Group created' : 'Group saved');
        this.reload(creating ? id : this.selectedId);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = this.messageFor(err, 'Could not save the group.');
      },
    });
  }

  remove() {
    const group = this.selected;
    if (!group || !this.canDelete) {
      return;
    }

    if (!confirm(`Delete the group "${group.accountGroupName}"?`)) {
      return;
    }

    const index = this.groups.indexOf(group);
    const neighbour = this.groups[index + 1] ?? this.groups[index - 1] ?? null;
    this.saving = true;
    this.errorMessage = null;
    this.service.deleteAccountGroup(group.accountGroupId).subscribe({
      next: () => {
        this.changed = true;
        this.toaster.success('Group deleted');
        this.reload(neighbour?.accountGroupId ?? null);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = this.messageFor(err, 'Could not delete the group.');
      },
    });
  }

  drop(event: CdkDragDrop<AccGroupViewModel[]>) {
    this.move(event.previousIndex, event.currentIndex);
  }

  move(from: number, to: number) {
    if (this.saving || from === to || to < 0 || to >= this.groups.length) {
      return;
    }

    moveItemInArray(this.groups, from, to);
    const moved = this.groups[to];
    const request: AccountGroupRequest = {
      accountGroupName: moved.accountGroupName,
      accountGroupDisplayValue: moved.accountGroupDisplayValue,
      accountGroupPosition: to + 1,
      displayDefault: moved.displayDefault,
    };

    this.saving = true;
    this.errorMessage = null;
    this.service.updateAccountGroup(request, moved.accountGroupId).subscribe({
      next: () => {
        this.changed = true;
        this.status = `Moved "${moved.accountGroupName}" to position ${to + 1}.`;
        this.reload(this.selectedId, true);
      },
      error: (err) => {
        this.errorMessage = this.messageFor(err, 'Could not move the group.');
        this.reload(this.selectedId, true);
      },
    });
  }

  close() {
    this.activeModal.close(this.changed);
  }

  /**
   * Loads the groups again and shares them with the Accounts page. With `keepEditor` the editor is left as it
   * is (a drag shouldn't throw away what is being typed); otherwise it shows the group with `selectId`, or the
   * first one.
   */
  private reload(selectId: number | null, keepEditor = false) {
    this.service.getAccountGroups().subscribe({
      next: (groups) => {
        this.viewModel.accountGroups = groups;
        this.groups = [...groups];
        this.saving = false;
        if (!keepEditor) {
          this.select(this.groups.find(group => group.accountGroupId === selectId) ?? this.groups[0] ?? null);
        }
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = this.messageFor(err, 'Could not reload the groups.');
      },
    });
  }

  private messageFor(err: any, fallback: string): string {
    if (err?.status === 404) {
      return 'This group was not found.';
    }

    return err?.error?.message ?? fallback;
  }
}
