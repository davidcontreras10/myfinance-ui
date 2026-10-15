import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { AccountViewApiService } from 'src/app/services/account-view-api.service';
import { AccountViewModelService } from 'src/app/services/account-view-model.service';
import { AccGroupViewModel } from 'src/app/services/models';
import { ToasterService } from 'src/app/services/toaster.service';
import { AccountsGroupsComponent } from './accounts-groups.component';

const group = (id: number, name: string, extra: Partial<AccGroupViewModel> = {}): AccGroupViewModel => ({
  accountGroupId: id,
  accountGroupName: name,
  accountGroupPosition: id,
  accountGroupDisplayValue: `${name} short`,
  isSelected: false,
  displayDefault: false,
  accountCount: 0,
  ...extra,
});

const threeGroups = () => [
  group(1, 'Principal', { displayDefault: true, accountCount: 3 }),
  group(2, 'Ahorros'),
  group(3, 'Gastos'),
];

describe('AccountsGroupsComponent logic', () => {
  let api: jasmine.SpyObj<any>;
  let activeModal: jasmine.SpyObj<any>;
  let toaster: jasmine.SpyObj<any>;
  let viewModel: AccountViewModelService;
  let component: AccountsGroupsComponent;

  const open = (groups: AccGroupViewModel[] = threeGroups()) => {
    viewModel.accountGroups = groups;
    component.ngOnInit();
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('AccountViewApiService',
      ['getAccountGroups', 'createNewAccountGroup', 'updateAccountGroup', 'deleteAccountGroup']);
    activeModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
    toaster = jasmine.createSpyObj('ToasterService', ['success']);
    viewModel = new AccountViewModelService();
    component = new AccountsGroupsComponent(activeModal, viewModel, api, toaster);
  });

  describe('opening', () => {
    it('shows the first group, including whether it is expanded on the Finance page', () => {
      open();

      expect(component.selectedId).toBe(1);
      expect(component.name).toBe('Principal');
      expect(component.displayValue).toBe('Principal short');
      expect(component.displayDefault).toBeTrue();
      expect(component.dirty).toBeFalse();
      expect(component.canSave).toBeFalse();
    });

    it('starts on a new group when the user has none', () => {
      open([]);

      expect(component.isNew).toBeTrue();
    });

    it('does not change the shared list when groups are reordered locally', () => {
      const shared = threeGroups();
      open(shared);
      api.updateAccountGroup.and.returnValue(of(0));
      api.getAccountGroups.and.returnValue(of(threeGroups()));

      component.move(0, 2);

      expect(shared.map(g => g.accountGroupId)).toEqual([1, 2, 3]);
    });
  });

  describe('editing', () => {
    beforeEach(() => open());

    it('can be saved once something changes and the text is long enough', () => {
      component.name = 'Principal 2';

      expect(component.canSave).toBeTrue();

      component.name = 'ab';

      expect(component.canSave).toBeFalse();
    });

    it('counts turning "expanded on the Finance page" off as a change', () => {
      component.displayDefault = false;

      expect(component.dirty).toBeTrue();
    });

    it('sends the group with its current position, trimmed, and keeps the modal open', () => {
      api.updateAccountGroup.and.returnValue(of(0));
      api.getAccountGroups.and.returnValue(of(threeGroups()));
      component.select(viewModel.accountGroups[1]);
      component.name = '  Ahorros dólares ';

      component.save();

      expect(api.updateAccountGroup).toHaveBeenCalledWith({
        accountGroupName: 'Ahorros dólares',
        accountGroupDisplayValue: 'Ahorros short',
        accountGroupPosition: 2,
        displayDefault: false,
      }, 2);
      expect(toaster.success).toHaveBeenCalledWith('Group saved');
      expect(activeModal.close).not.toHaveBeenCalled();
      expect(component.changed).toBeTrue();
    });

    it('keeps the default flag of a group when only its name changes', () => {
      api.updateAccountGroup.and.returnValue(of(0));
      api.getAccountGroups.and.returnValue(of(threeGroups()));
      component.name = 'Principal renamed';

      component.save();

      expect(api.updateAccountGroup.calls.mostRecent().args[0].displayDefault).toBeTrue();
    });

    it('shows the API message and stays editable when saving fails', () => {
      api.updateAccountGroup.and.returnValue(throwError(() => ({ status: 400, error: { message: 'Nope.' } })));
      component.name = 'Principal 2';

      component.save();

      expect(component.errorMessage).toBe('Nope.');
      expect(component.saving).toBeFalse();
      expect(component.name).toBe('Principal 2');
    });

    it('does nothing when there is no change', () => {
      component.save();

      expect(api.updateAccountGroup).not.toHaveBeenCalled();
    });
  });

  describe('creating', () => {
    beforeEach(() => open());

    it('starts empty, and the display name follows the name until it is typed by hand', () => {
      component.startNew();

      expect(component.isNew).toBeTrue();
      expect(component.name).toBe('');

      component.name = 'Viajes';
      component.onNameChange('Viajes');
      expect(component.displayValue).toBe('Viajes');

      component.displayValue = 'Trips';
      component.onDisplayValueChange();
      component.name = 'Viajes 2027';
      component.onNameChange('Viajes 2027');
      expect(component.displayValue).toBe('Trips');
    });

    it('adds the group at the end, then shows it', () => {
      const created = [...threeGroups(), group(9, 'Viajes')];
      api.createNewAccountGroup.and.returnValue(of(9));
      api.getAccountGroups.and.returnValue(of(created));
      component.startNew();
      component.name = 'Viajes';
      component.onNameChange('Viajes');

      component.save();

      expect(api.createNewAccountGroup).toHaveBeenCalledWith({
        accountGroupName: 'Viajes',
        accountGroupDisplayValue: 'Viajes',
        accountGroupPosition: 4,
        displayDefault: false,
      });
      expect(toaster.success).toHaveBeenCalledWith('Group created');
      expect(component.selectedId).toBe(9);
      expect(viewModel.accountGroups.length).toBe(4);
    });
  });

  describe('reordering', () => {
    beforeEach(() => open());

    it('sends the new 1-based position with the saved fields, and reloads', () => {
      api.updateAccountGroup.and.returnValue(of(0));
      api.getAccountGroups.and.returnValue(of([threeGroups()[1], threeGroups()[2], threeGroups()[0]]));

      component.move(0, 2);

      expect(api.updateAccountGroup).toHaveBeenCalledWith({
        accountGroupName: 'Principal',
        accountGroupDisplayValue: 'Principal short',
        accountGroupPosition: 3,
        displayDefault: true,
      }, 1);
      expect(component.groups.map(g => g.accountGroupId)).toEqual([2, 3, 1]);
      expect(viewModel.accountGroups.map(g => g.accountGroupId)).toEqual([2, 3, 1]);
      expect(component.status).toBe('Moved "Principal" to position 3.');
    });

    it('does not throw away what is being typed', () => {
      api.updateAccountGroup.and.returnValue(of(0));
      api.getAccountGroups.and.returnValue(of(threeGroups()));
      component.name = 'Typing something new';

      component.move(1, 2);

      expect(component.name).toBe('Typing something new');
    });

    it('shows the error and goes back to the server order when the move fails', () => {
      api.updateAccountGroup.and.returnValue(throwError(() => ({ status: 500 })));
      api.getAccountGroups.and.returnValue(of(threeGroups()));

      component.move(0, 1);

      expect(component.errorMessage).toBe('Could not move the group.');
      expect(component.groups.map(g => g.accountGroupId)).toEqual([1, 2, 3]);
    });

    it('ignores moves outside the list and while saving', () => {
      component.move(0, -1);
      component.move(2, 3);
      component.move(1, 1);
      component.saving = true;
      component.move(0, 1);

      expect(api.updateAccountGroup).not.toHaveBeenCalled();
    });
  });

  describe('deleting', () => {
    beforeEach(() => open());

    it('is not offered for a group that still has accounts, and says why', () => {
      expect(component.canDelete).toBeFalse();
      expect(component.deleteHint).toBe('This group has 3 accounts. Move or delete them first.');

      component.remove();

      expect(api.deleteAccountGroup).not.toHaveBeenCalled();
    });

    it('is available for an empty group', () => {
      component.select(viewModel.accountGroups[1]);

      expect(component.canDelete).toBeTrue();
      expect(component.deleteHint).toBeNull();
    });

    it('does nothing when the confirmation is declined', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.select(viewModel.accountGroups[1]);

      component.remove();

      expect(api.deleteAccountGroup).not.toHaveBeenCalled();
    });

    it('deletes after confirmation and shows the next group', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      api.deleteAccountGroup.and.returnValue(of(undefined));
      api.getAccountGroups.and.returnValue(of([threeGroups()[0], threeGroups()[2]]));
      component.select(viewModel.accountGroups[1]);

      component.remove();

      expect(api.deleteAccountGroup).toHaveBeenCalledWith(2);
      expect(toaster.success).toHaveBeenCalledWith('Group deleted');
      expect(component.selectedId).toBe(3);
      expect(component.groups.length).toBe(2);
    });

    it('shows the API message when the server refuses', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      api.deleteAccountGroup.and.returnValue(
        throwError(() => ({ status: 400, error: { message: 'Accounts still associated to this group' } })));
      component.select(viewModel.accountGroups[1]);

      component.remove();

      expect(component.errorMessage).toBe('Accounts still associated to this group');
      expect(component.saving).toBeFalse();
    });
  });

  describe('closing', () => {
    beforeEach(() => open());

    it('tells the page nothing changed when nothing did', () => {
      component.close();

      expect(activeModal.close).toHaveBeenCalledWith(false);
    });

    it('tells the page something changed after a save', () => {
      api.updateAccountGroup.and.returnValue(of(0));
      api.getAccountGroups.and.returnValue(of(threeGroups()));
      component.name = 'Principal 2';
      component.save();

      component.close();

      expect(activeModal.close).toHaveBeenCalledWith(true);
    });
  });
});

describe('AccountsGroupsComponent template', () => {
  let fixture: ComponentFixture<AccountsGroupsComponent>;
  let el: HTMLElement;
  let viewModel: AccountViewModelService;

  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const create = async (groups: AccGroupViewModel[] = threeGroups()) => {
    viewModel.accountGroups = groups;
    fixture = TestBed.createComponent(AccountsGroupsComponent);
    el = fixture.nativeElement;
    await render();
  };

  beforeEach(async () => {
    viewModel = new AccountViewModelService();
    await TestBed.configureTestingModule({
      declarations: [AccountsGroupsComponent],
      imports: [FormsModule],
      providers: [
        { provide: AccountViewModelService, useValue: viewModel },
        { provide: AccountViewApiService, useValue: jasmine.createSpyObj('AccountViewApiService', ['getAccountGroups']) },
        { provide: NgbActiveModal, useValue: jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']) },
        { provide: ToasterService, useValue: jasmine.createSpyObj('ToasterService', ['success']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('lists the groups in order with their positions, and no Position field', async () => {
    await create();

    const rows = Array.from(el.querySelectorAll('.group-row'));
    expect(rows.map(r => r.querySelector('.group-name')?.textContent?.trim())).toEqual(['Principal', 'Ahorros', 'Gastos']);
    expect(rows.map(r => r.querySelector('.position')?.textContent?.trim())).toEqual(['1', '2', '3']);
    expect(el.textContent).not.toContain('Position 0');
    expect(el.querySelector('input[type="number"]')).toBeNull();
  });

  it('notes "0 accounts" only on the groups that are empty', async () => {
    await create([group(1, 'A group', { accountCount: 3 }), group(2, 'B group'), group(3, 'C group', { accountCount: 1 })]);

    const notes = Array.from(el.querySelectorAll('.group-row')).map(row => row.querySelector('.empty-note')?.textContent?.trim() ?? null);
    expect(notes).toEqual([null, '0 accounts', null]);
  });

  it('marks only the groups expanded on the Finance page, and ticks the box for the open one', async () => {
    await create([group(1, 'A group', { displayDefault: true }), group(2, 'B group'), group(3, 'C group', { displayDefault: true })]);

    expect(el.querySelectorAll('.open-badge').length).toBe(2);
    expect((el.querySelector('#group-default') as HTMLInputElement).checked).toBeTrue();

    (el.querySelectorAll('.group-pick')[1] as HTMLButtonElement).click();
    await render();

    expect((el.querySelector('#group-default') as HTMLInputElement).checked).toBeFalse();
  });

  it('keeps Save disabled until something changes', async () => {
    await create();
    const save = () => el.querySelector('#save-group') as HTMLButtonElement;
    expect(save().disabled).toBeTrue();

    const name = el.querySelector('#group-name') as HTMLInputElement;
    name.value = 'Principal renamed';
    name.dispatchEvent(new Event('input'));
    await render();

    expect(save().disabled).toBeFalse();
  });

  it('disables Delete and explains why for a group with accounts', async () => {
    await create();

    expect((el.querySelector('#delete-group') as HTMLButtonElement).disabled).toBeTrue();
    expect(el.querySelector('.delete-hint')?.textContent).toContain('This group has 3 accounts');
  });

  it('offers no Delete for a new group', async () => {
    await create();

    (el.querySelector('#new-group') as HTMLButtonElement).click();
    await render();

    expect(el.querySelector('#delete-group')).toBeNull();
    expect((el.querySelector('#save-group') as HTMLButtonElement).textContent).toContain('Create group');
  });

  it('cannot move the first group up or the last one down', async () => {
    await create();

    expect((el.querySelectorAll('.move-up')[0] as HTMLButtonElement).disabled).toBeTrue();
    expect((el.querySelectorAll('.move-down')[2] as HTMLButtonElement).disabled).toBeTrue();
    expect((el.querySelectorAll('.move-down')[0] as HTMLButtonElement).disabled).toBeFalse();
  });
});
