import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AccountViewApiService } from '../services/account-view-api.service';
import { BasicAccountIncluded, SelectableItem } from '../services/models';
import { NavigationService } from '../services/navigation.service';
import { NewAccountComponent } from './new-account.component';

// No TestBed here: these tests exercise the component's main-account rules directly, so they
// don't depend on the template or on the HTTP/router providers.
describe('NewAccountComponent main account rules', () => {
  const method = (id: number, name: string, isSelected: boolean): SelectableItem => ({
    id, name, isDefault: false, isSelected,
  });

  const candidate = (overrides: Partial<BasicAccountIncluded> = {}): BasicAccountIncluded => ({
    id: 10,
    name: 'Bac Colones',
    isDefault: false,
    isSelected: false,
    methodIds: [method(3, 'Colones default', true)],
    hasParent: false,
    requiredFinancialEntityId: null,
    requiresMethodChoice: false,
    ...overrides,
  });

  let api: jasmine.SpyObj<any>;
  let component: NewAccountComponent;

  beforeEach(() => {
    api = jasmine.createSpyObj('AccountViewApiService', ['getPossibleAccountInclude']);
    component = new NewAccountComponent(api, {} as any, {} as any, {} as any);
    component.viewModel = { accountIncludeViewModels: [] } as any;
  });

  describe('financial entity', () => {
    it('is set to the main account\'s entity and locked when creating', () => {
      component.onParentAccountChanged(candidate({ requiredFinancialEntityId: 2 }));

      expect(component.inputModel.selectedFinancialEntityId).toBe(2);
      expect(component.financialEntityLocked).toBeTrue();
      expect(component.financialEntityLockedBy).toBe('Bac Colones');
    });

    it('is unlocked again when the main account is cleared', () => {
      component.onParentAccountChanged(candidate({ requiredFinancialEntityId: 2 }));
      component.onParentAccountChanged(undefined);

      expect(component.financialEntityLocked).toBeFalse();
    });

    it('stays free when the main account has no entity', () => {
      component.onParentAccountChanged(candidate({ requiredFinancialEntityId: null }));

      expect(component.financialEntityLocked).toBeFalse();
    });

    it('is not touched when editing an existing account', () => {
      component.inputModel.editMode = true;
      component.inputModel.selectedFinancialEntityId = 5;

      component.onParentAccountChanged(candidate({ requiredFinancialEntityId: 2 }));

      expect(component.inputModel.selectedFinancialEntityId).toBe(5);
      expect(component.financialEntityLocked).toBeFalse();
    });

    it('stays locked when started from "+ Add child" even with no main account applied', () => {
      component.pendingParentAccountId = 10;
      component.financialEntityLocked = true;

      component.onParentAccountChanged(undefined);

      expect(component.financialEntityLocked).toBeTrue();
    });
  });

  describe('exchange method', () => {
    it('is the one the server selected when it is determined', () => {
      component.onParentAccountChanged(candidate());

      expect(component.inputModel.selectedMethodIds[10]?.id).toBe(3);
      expect(component.parentIssue()).toBeNull();
    });

    it('is left empty until the user chooses when several methods are valid', () => {
      const methods = [method(1, 'Bac SJ Col-Dol', false), method(1006, 'Scotia Col-Dol', false)];
      component.onParentAccountChanged(candidate({ methodIds: methods, requiresMethodChoice: true }));

      expect(component.inputModel.selectedMethodIds[10]).toBeUndefined();
      expect(component.parentIssue()).toBeNull(); // the required select blocks saving instead

      component.onMethodSelected(methods[1]);

      expect(component.inputModel.selectedMethodIds[10]?.id).toBe(1006);
    });

    it('is sent as the single account include when saving', () => {
      component.onParentAccountChanged(candidate());

      expect((component as any).readAccountIncludes()).toEqual([
        { accountId: 0, accountIncludeId: 10, currencyConverterMethodId: 3 },
      ]);
    });

    it('sends no account include when there is no main account', () => {
      expect((component as any).readAccountIncludes()).toEqual([]);
    });
  });

  describe('new account request', () => {
    it('always sends a base budget of 0', () => {
      const form = {
        valid: true,
        value: {
          accountGroupId: '1', accountName: 'X', headerColor: '#000000', borderColor: '#ffffff',
          periodType: '2', currencyId: '1', financialEntityId: '2', accountTypeId: '2', spendTypeId: '1',
          defaultCurrencyId: '0', isDefaultPending: false,
        },
      };

      const model = (component as any).readNewSubmitModel(form);

      expect(model.baseBudget).toBe(0);
    });
  });

  describe('main account without an exchange method', () => {
    it('reports an issue instead of silently dropping the main account', () => {
      component.onParentAccountChanged(candidate({ methodIds: [] }));

      expect(component.parentIssue()).toContain('no exchange method');
    });

    it('is not applied from "+ Add child", and saving is blocked with a message', () => {
      component.pendingParentAccountId = 10;
      component.addChildParentName = 'Bac Colones';
      component.accountIncludesLoaded = true;
      component.viewModel.accountIncludeViewModels = [candidate({ methodIds: [] })];

      (component as any).tryApplyPendingParent();

      expect(component.inputModel.selectedParentAcc).toBeUndefined();
      expect(component.parentIssue()).toContain('Bac Colones');
    });
  });

  describe('loading the main account candidates', () => {
    it('applies the "+ Add child" main account and its entity once candidates arrive', () => {
      api.getPossibleAccountInclude.and.returnValue(of([candidate({ requiredFinancialEntityId: 2 })]));
      component.pendingParentAccountId = 10;
      component.inputModel.selectedCurrencyId = 1;

      component.onCurrencyChanged();

      expect(component.accountIncludesLoaded).toBeTrue();
      expect(component.inputModel.selectedParentAcc?.id).toBe(10);
      expect(component.inputModel.selectedFinancialEntityId).toBe(2);
      expect(component.financialEntityLocked).toBeTrue();
    });

    it('clears a chosen main account (and unlocks the entity) when the currency changes', () => {
      api.getPossibleAccountInclude.and.returnValue(of([candidate({ requiredFinancialEntityId: 2 })]));
      component.inputModel.selectedCurrencyId = 1;
      component.onParentAccountChanged(candidate({ requiredFinancialEntityId: 2 }));

      component.onCurrencyChanged();

      expect(component.inputModel.selectedParentAcc).toBeUndefined();
      expect(component.financialEntityLocked).toBeFalse();
    });

    it('does not re-select a main account that has no exchange method for the new currency', () => {
      api.getPossibleAccountInclude.and.returnValue(of([candidate({ methodIds: [] })]));
      component.inputModel.selectedCurrencyId = 1;
      component.onParentAccountChanged(candidate());

      component.onFianancialEntityChanged();

      expect(component.inputModel.selectedParentAcc).toBeUndefined();
    });
  });
});

describe('NewAccountComponent main account template', () => {
  const method = (id: number, name: string, isSelected: boolean): SelectableItem => ({
    id, name, isDefault: false, isSelected,
  });

  const candidate = (overrides: Partial<BasicAccountIncluded>): BasicAccountIncluded => ({
    id: 10,
    name: 'Bac Colones',
    isDefault: false,
    isSelected: false,
    methodIds: [method(3, 'Colones default', true)],
    hasParent: false,
    requiredFinancialEntityId: null,
    requiresMethodChoice: false,
    ...overrides,
  });

  let fixture: ComponentFixture<NewAccountComponent>;
  let component: NewAccountComponent;
  let el: HTMLElement;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('AccountViewApiService', ['getAddAccountViewModel', 'getPossibleAccountInclude']);
    apiSpy.getAddAccountViewModel.and.returnValue(of({
      currencyViewModels: [{ id: 1, name: 'CRC' }],
      periodTypeViewModels: [], accountTypeViewModels: [], spendTypeViewModels: [],
      financialEntityViewModels: [{ id: 2, name: 'Bac San Jose' }],
      accountGroupViewModels: [], accountIncludeViewModels: [],
    }));
    apiSpy.getPossibleAccountInclude.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [NewAccountComponent],
      imports: [FormsModule],
      providers: [
        { provide: AccountViewApiService, useValue: apiSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { url: [{ path: 'accounts' }, { path: 'new' }], params: {} }, queryParams: of({}) } },
        { provide: Router, useValue: {} },
        { provide: NavigationService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NewAccountComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    component.inputModel.selectedCurrencyId = 1;
  });

  const render = () => {
    fixture.detectChanges();
    return fixture.whenStable().then(() => fixture.detectChanges());
  };

  it('hides the exchange method completely when it is determined', async () => {
    component.viewModel.accountIncludeViewModels = [candidate({})];
    component.onParentAccountChanged(component.viewModel.accountIncludeViewModels[0]);
    await render();

    expect(el.querySelector('#exchange-method')).toBeNull();
    expect(el.textContent).not.toContain('Exchange method');
    expect(el.textContent).not.toContain('Colones default');
  });

  it('has no base budget field', async () => {
    await render();

    expect(el.querySelector('#base-budget')).toBeNull();
    expect(el.textContent).not.toContain('Base Budget');
  });

  it('shows a required method picker when the user must choose', async () => {
    const methods = [method(1, 'Bac SJ Col-Dol', false), method(1006, 'Scotia Col-Dol', false)];
    component.viewModel.accountIncludeViewModels = [candidate({ methodIds: methods, requiresMethodChoice: true })];
    component.onParentAccountChanged(component.viewModel.accountIncludeViewModels[0]);
    await render();

    const select = el.querySelector('#exchange-method') as HTMLSelectElement;
    expect(select).not.toBeNull();
    expect(select.required).toBeTrue();
    const labels = Array.from(select.options).map((o) => o.textContent?.trim());
    expect(labels).toContain('Bac SJ Col-Dol');
    expect(labels).toContain('Scotia Col-Dol');
  });

  it('disables a main account that has no exchange method for the currency, and says why', async () => {
    component.viewModel.accountIncludeViewModels = [candidate({ methodIds: [] })];
    await render();

    const option = Array.from((el.querySelector('#parent-account') as HTMLSelectElement).options)
      .find((o) => o.textContent?.includes('Bac Colones'));
    expect(option?.disabled).toBeTrue();
    expect(option?.textContent).toContain('no exchange method');
  });

  it('shows who the financial entity is locked to', async () => {
    component.viewModel.accountIncludeViewModels = [candidate({ requiredFinancialEntityId: 2 })];
    component.onParentAccountChanged(component.viewModel.accountIncludeViewModels[0]);
    await render();

    const entity = el.querySelector('#account-financial-entity') as HTMLSelectElement;
    expect(entity.disabled).toBeTrue();
    expect(el.textContent).toContain('Same as Bac Colones');
  });

  it('does not repeat the main account as a field when arriving from "+ Add child"', async () => {
    component.pendingParentAccountId = 10;
    component.addChildParentName = 'Bac Colones';
    await render();

    expect(el.querySelector('#parent-account')).toBeNull();
    expect(el.textContent).toContain('Adding a child account under');
    expect(el.textContent).toContain('Bac Colones');
  });

  it('shows the parent account field in the normal new account form', async () => {
    await render();

    expect(el.querySelector('#parent-account')).not.toBeNull();
  });

  it('shows the blocking message when the main account from "+ Add child" cannot be used', async () => {
    component.pendingParentAccountId = 10;
    component.addChildParentName = 'Bac Colones';
    component.accountIncludesLoaded = true;
    await render();

    expect(el.textContent).toContain("Bac Colones can't be the main account");
  });
});
