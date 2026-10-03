import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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

  describe('suggested period type and account type', () => {
    // Account type ids here are arbitrary; the API decides which type to suggest.
    const MAIN_TYPE = 3;
    const SUB_TYPE = 2;
    const periodTypes = (selectedId?: number): SelectableItem[] =>
      [1, 2, 3].map((id) => ({ id, name: `p${id}`, isDefault: false, isSelected: id === selectedId }));
    const accountTypes = (): SelectableItem[] =>
      [SUB_TYPE, MAIN_TYPE].map((id) => ({ id, name: `t${id}`, isDefault: false, isSelected: false }));

    beforeEach(() => {
      component.viewModel = {
        accountIncludeViewModels: [],
        periodTypeViewModels: periodTypes(2),
        accountTypeViewModels: accountTypes(),
        suggestedAccountTypeIdForMainAccount: MAIN_TYPE,
        suggestedAccountTypeIdForSubAccount: SUB_TYPE,
      } as any;
    });

    it('preselects the period type the API marks as default', () => {
      (component as any).applyPeriodTypeDefault();

      expect(component.inputModel.selectedPeriodTypeId).toBe(2);
    });

    it('preselects nothing, and opens the advanced section, when no period type is marked', () => {
      component.viewModel.periodTypeViewModels = periodTypes(undefined);

      (component as any).applyPeriodTypeDefault();

      expect(component.inputModel.selectedPeriodTypeId).toBeUndefined();
      expect(component.advancedNeedsAttention).toBeTrue();
      expect(component.showAdvanced).toBeTrue();
    });

    it('does not overwrite a period type that is already chosen', () => {
      component.inputModel.selectedPeriodTypeId = 3;

      (component as any).applyPeriodTypeDefault();

      expect(component.inputModel.selectedPeriodTypeId).toBe(3);
    });

    it('suggests the main account type when there is no main account', () => {
      (component as any).applyAccountTypeSuggestion();

      expect(component.inputModel.selectedAccountTypeId).toBe(MAIN_TYPE);
    });

    it('suggests the sub-account type once a main account is chosen, and goes back when it is cleared', () => {
      component.onParentAccountChanged(candidate());
      expect(component.inputModel.selectedAccountTypeId).toBe(SUB_TYPE);

      component.onParentAccountChanged(undefined);
      expect(component.inputModel.selectedAccountTypeId).toBe(MAIN_TYPE);
    });

    it('suggests the sub-account type when started from "+ Add child"', () => {
      component.pendingParentAccountId = 10;

      (component as any).applyAccountTypeSuggestion();

      expect(component.inputModel.selectedAccountTypeId).toBe(SUB_TYPE);
    });

    it('stops suggesting once the user has chosen an account type', () => {
      (component as any).applyAccountTypeSuggestion();
      component.inputModel.selectedAccountTypeId = SUB_TYPE;
      component.onAccountTypeChanged();

      component.onParentAccountChanged(candidate());
      component.onParentAccountChanged(undefined);

      expect(component.inputModel.selectedAccountTypeId).toBe(SUB_TYPE);
    });

    it('does not suggest a type that is not in the list or that the API did not suggest', () => {
      component.viewModel.suggestedAccountTypeIdForMainAccount = 99;
      (component as any).applyAccountTypeSuggestion();
      expect(component.inputModel.selectedAccountTypeId).toBeUndefined();

      component.viewModel.suggestedAccountTypeIdForMainAccount = null;
      (component as any).applyAccountTypeSuggestion();
      expect(component.inputModel.selectedAccountTypeId).toBeUndefined();
    });

    it('leaves the account type alone when editing', () => {
      component.inputModel.editMode = true;
      component.inputModel.selectedAccountTypeId = SUB_TYPE;

      component.onParentAccountChanged(undefined);

      expect(component.inputModel.selectedAccountTypeId).toBe(SUB_TYPE);
    });

    it('keeps the advanced section closed while both fields have a value, until it is opened', () => {
      component.inputModel.selectedPeriodTypeId = 2;
      component.inputModel.selectedAccountTypeId = MAIN_TYPE;

      expect(component.showAdvanced).toBeFalse();

      component.advancedExpanded = true;

      expect(component.showAdvanced).toBeTrue();
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
      imports: [FormsModule, NgbModule],
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

  it('has no base budget field when creating an account', async () => {
    await render();

    expect(el.querySelector('#base-budget')).toBeNull();
    expect(el.textContent).not.toContain('Base Budget');
  });

  it('shows the base budget field when editing an account', async () => {
    component.inputModel.editMode = true;
    await render();

    expect(el.querySelector('#base-budget')).not.toBeNull();
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

  describe('advanced settings', () => {
    const panel = () => el.querySelector('#advanced-settings') as HTMLElement;

    it('is closed by default when both fields already have a value, but the fields stay in the form', async () => {
      component.inputModel.selectedPeriodTypeId = 2;
      component.inputModel.selectedAccountTypeId = 3;
      await render();

      expect(panel().classList.contains('show')).toBeFalse();
      expect(el.querySelector('#account-period-type')).not.toBeNull();
      expect(el.querySelector('#account-type')).not.toBeNull();
    });

    it('opens when the toggle is clicked', async () => {
      component.inputModel.selectedPeriodTypeId = 2;
      component.inputModel.selectedAccountTypeId = 3;
      await render();

      const toggle = el.querySelector('#advanced-toggle') as HTMLButtonElement;
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      toggle.click();
      await render();

      // ng-bootstrap adds the "show" class only after its open animation, so check the toggle's state instead.
      expect(component.showAdvanced).toBeTrue();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('opens by itself, with a message, when a field has no value', async () => {
      component.inputModel.selectedPeriodTypeId = undefined;
      component.inputModel.selectedAccountTypeId = 3;
      await render();

      expect(panel().classList.contains('show')).toBeTrue();
      expect(el.textContent).toContain('Choose a period type and an account type to continue');
    });
  });

  describe('required fields', () => {
    it('marks the label of every required control with the required class, and only those', async () => {
      // Edit mode shows the base budget, and a main account that needs a choice shows the exchange method, so
      // every required control is on screen.
      component.inputModel.editMode = true;
      const methods = [method(1, 'Bac SJ Col-Dol', false), method(1006, 'Scotia Col-Dol', false)];
      component.viewModel.accountIncludeViewModels = [candidate({ methodIds: methods, requiresMethodChoice: true })];
      component.onParentAccountChanged(component.viewModel.accountIncludeViewModels[0]);
      await render();

      const requiredControlIds = Array.from(el.querySelectorAll('input[required], select[required]'))
        .map((c) => c.id)
        .filter((id) => !!id)
        .sort();
      const markedLabelFors = Array.from(el.querySelectorAll('label.required'))
        .map((l) => l.getAttribute('for'))
        .sort();

      expect(requiredControlIds.length).toBeGreaterThan(5);
      expect(markedLabelFors).toEqual(requiredControlIds);
    });

    it('explains the asterisk', async () => {
      await render();

      expect(el.textContent).toContain('Required fields');
    });
  });

  describe('transaction defaults', () => {
    it('keeps the default currency and the pending switch inside the advanced settings', async () => {
      await render();

      const panel = el.querySelector('#advanced-settings') as HTMLElement;
      expect(panel.querySelector('#account-default-currency')).not.toBeNull();
      expect(panel.querySelector('#new-trx-pending')).not.toBeNull();
    });
  });

  describe('style', () => {
    const panel = () => el.querySelector('#style-settings') as HTMLElement;
    const preview = () => el.querySelector('#style-preview') as HTMLElement;
    const header = () => el.querySelector('.style-preview-header') as HTMLElement;

    it('is closed by default, and the color fields stay in the form', async () => {
      component.viewModel.accountStyle = { headerColor: '#ffffff', borderColor: '#5f9ea0' };
      await render();

      expect(panel().classList.contains('show')).toBeFalse();
      expect(el.querySelector('#header-color')).not.toBeNull();
      expect(el.querySelector('#border-color')).not.toBeNull();
    });

    it('opens when the toggle is clicked', async () => {
      await render();
      const toggle = el.querySelector('#style-toggle') as HTMLButtonElement;
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      toggle.click();
      await render();

      expect(component.styleExpanded).toBeTrue();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('previews the colors like the finance screen: a 5px frame, and the header color behind the title only', async () => {
      component.viewModel.accountStyle = { headerColor: '#ffffff', borderColor: '#5f9ea0' };
      component.inputModel.headerColor = '#ff0000';
      component.inputModel.borderColor = '#00aa00';
      component.inputModel.accountName = 'Mensual Comida';
      await render();

      expect(preview().style.border).toContain('5px');
      expect(preview().style.border).toContain('rgb(0, 170, 0)');
      expect(header().style.background).toContain('rgb(255, 0, 0)');
      expect(header().textContent).toContain('Mensual Comida');
      expect(header().textContent).toContain('Period:');
    });

    it('shows a placeholder name in the preview when the account has no name yet', async () => {
      await render();

      expect(header().textContent).toContain('Account name');
    });

    it('shows the current colors as swatches in the bar', async () => {
      component.inputModel.headerColor = '#ff0000';
      component.inputModel.borderColor = '#00aa00';
      await render();

      const swatches = Array.from(el.querySelectorAll('#style-toggle .swatch')) as HTMLElement[];
      expect(swatches.length).toBe(2);
      expect(swatches[0].style.background).toContain('rgb(255, 0, 0)');
      expect(swatches[1].style.background).toContain('rgb(0, 170, 0)');
    });
  });
});
