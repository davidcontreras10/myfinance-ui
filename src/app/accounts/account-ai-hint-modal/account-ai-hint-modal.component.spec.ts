import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { AccountViewApiService } from 'src/app/services/account-view-api.service';
import { AccountAiClassificationHint } from 'src/app/services/models';
import { ToasterService } from 'src/app/services/toaster.service';
import { AccountAiHintModalComponent } from './account-ai-hint-modal.component';

const hintOf = (text: string | null): AccountAiClassificationHint => ({
  accountId: 7,
  accountName: 'Ingresos Ahorros',
  aiClassificationHint: text,
});

describe('AccountAiHintModalComponent logic', () => {
  let api: jasmine.SpyObj<any>;
  let activeModal: jasmine.SpyObj<any>;
  let toaster: jasmine.SpyObj<any>;
  let component: AccountAiHintModalComponent;

  const loadWith = (text: string | null) => {
    api.getAiClassificationHint.and.returnValue(of(hintOf(text)));
    component.ngOnInit();
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('AccountViewApiService', ['getAiClassificationHint', 'updateAiClassificationHint']);
    activeModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
    toaster = jasmine.createSpyObj('ToasterService', ['success']);
    component = new AccountAiHintModalComponent(activeModal, api, toaster);
    component.accountId = 7;
    component.accountName = 'Ingresos Ahorros';
  });

  describe('loading', () => {
    it('shows the saved hint, with nothing to save yet', () => {
      loadWith('AI subscriptions');

      expect(component.text).toBe('AI subscriptions');
      expect(component.loading).toBeFalse();
      expect(component.hasSavedHint).toBeTrue();
      expect(component.dirty).toBeFalse();
      expect(component.canSave).toBeFalse();
    });

    it('starts empty when the account has no hint', () => {
      loadWith(null);

      expect(component.text).toBe('');
      expect(component.hasSavedHint).toBeFalse();
    });

    it('says the account was not found on a 404, and blocks saving', () => {
      api.getAiClassificationHint.and.returnValue(throwError(() => ({ status: 404 })));
      component.ngOnInit();
      component.text = 'something';

      expect(component.errorMessage).toBe('This account was not found.');
      expect(component.loadFailed).toBeTrue();
      expect(component.canSave).toBeFalse();
    });

    it('loads again on "Try again"', () => {
      api.getAiClassificationHint.and.returnValue(throwError(() => ({ status: 500 })));
      component.ngOnInit();

      loadWith('back');

      expect(component.loadFailed).toBeFalse();
      expect(component.errorMessage).toBeNull();
      expect(component.text).toBe('back');
    });
  });

  describe('editing', () => {
    beforeEach(() => loadWith('AI subscriptions'));

    it('can be saved once the text changes', () => {
      component.text = 'AI subscriptions and tools';

      expect(component.dirty).toBeTrue();
      expect(component.canSave).toBeTrue();
    });

    it('does not count whitespace around the text as a change', () => {
      component.text = '  AI subscriptions  ';

      expect(component.dirty).toBeFalse();
    });
  });

  describe('saving', () => {
    beforeEach(() => loadWith('AI subscriptions'));

    it('sends the trimmed text, closes, and tells the screen the account has a hint', () => {
      api.updateAiClassificationHint.and.returnValue(of(hintOf('Azure hosting')));
      component.text = '  Azure hosting  ';

      component.save();

      expect(api.updateAiClassificationHint).toHaveBeenCalledWith(7, 'Azure hosting');
      expect(toaster.success).toHaveBeenCalledWith('AI hint saved');
      expect(activeModal.close).toHaveBeenCalledWith({ accountId: 7, hasHint: true });
    });

    it('sends null (not undefined) when the text is emptied, which clears the hint', () => {
      api.updateAiClassificationHint.and.returnValue(of(hintOf(null)));
      component.text = '   ';

      component.save();

      expect(api.updateAiClassificationHint).toHaveBeenCalledWith(7, null);
      expect(toaster.success).toHaveBeenCalledWith('AI hint cleared');
      expect(activeModal.close).toHaveBeenCalledWith({ accountId: 7, hasHint: false });
    });

    it('does nothing when there is no change', () => {
      component.save();

      expect(api.updateAiClassificationHint).not.toHaveBeenCalled();
    });

    it('shows the API message and stays open when saving fails', () => {
      api.updateAiClassificationHint.and.returnValue(
        throwError(() => ({ status: 400, error: { message: 'The hint is too long.' } }))
      );
      component.text = 'changed';

      component.save();

      expect(component.errorMessage).toBe('The hint is too long.');
      expect(component.saving).toBeFalse();
      expect(activeModal.close).not.toHaveBeenCalled();
    });

    it('falls back to a generic message when the API gives none', () => {
      api.updateAiClassificationHint.and.returnValue(throwError(() => ({ status: 500 })));
      component.text = 'changed';

      component.save();

      expect(component.errorMessage).toBe('Could not save the hint.');
    });
  });

  describe('clearing', () => {
    beforeEach(() => loadWith('AI subscriptions'));

    it('sends null after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      api.updateAiClassificationHint.and.returnValue(of(hintOf(null)));

      component.clear();

      expect(api.updateAiClassificationHint).toHaveBeenCalledWith(7, null);
      expect(activeModal.close).toHaveBeenCalledWith({ accountId: 7, hasHint: false });
    });

    it('does nothing when the confirmation is declined', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.clear();

      expect(api.updateAiClassificationHint).not.toHaveBeenCalled();
    });

    it('is not available when there is no saved hint', () => {
      loadWith(null);
      const confirmSpy = spyOn(window, 'confirm');

      component.clear();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(api.updateAiClassificationHint).not.toHaveBeenCalled();
    });
  });
});

describe('AccountAiHintModalComponent template', () => {
  let fixture: ComponentFixture<AccountAiHintModalComponent>;
  let component: AccountAiHintModalComponent;
  let el: HTMLElement;
  let api: jasmine.SpyObj<any>;

  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const create = async (saved: string | null) => {
    api.getAiClassificationHint.and.returnValue(of(hintOf(saved)));
    fixture = TestBed.createComponent(AccountAiHintModalComponent);
    component = fixture.componentInstance;
    component.accountId = 7;
    component.accountName = 'Ingresos Ahorros';
    el = fixture.nativeElement;
    await render();
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj('AccountViewApiService', ['getAiClassificationHint', 'updateAiClassificationHint']);
    await TestBed.configureTestingModule({
      declarations: [AccountAiHintModalComponent],
      imports: [FormsModule],
      providers: [
        { provide: AccountViewApiService, useValue: api },
        { provide: NgbActiveModal, useValue: jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']) },
        { provide: ToasterService, useValue: jasmine.createSpyObj('ToasterService', ['success']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('shows the account, the explanation, the example and the 4000 character limit', async () => {
    await create(null);

    expect(el.textContent).toContain('Ingresos Ahorros');
    expect(el.textContent).toContain('only offered to the AI if it has a hint');
    expect(el.textContent).toContain('AI subscriptions such as OpenAI');
    expect((el.querySelector('#ai-hint-text') as HTMLTextAreaElement).maxLength).toBe(4000);
    expect(el.textContent).toContain('0 / 4000');
  });

  it('puts the saved hint in the text box and counts its characters', async () => {
    await create('Azure hosting');

    expect((el.querySelector('#ai-hint-text') as HTMLTextAreaElement).value).toBe('Azure hosting');
    expect(el.textContent).toContain('13 / 4000');
  });

  it('only offers "Clear hint" when a hint is saved', async () => {
    await create('Azure hosting');
    expect(el.querySelector('#clear-hint')).not.toBeNull();

    await create(null);
    expect(el.querySelector('#clear-hint')).toBeNull();
  });

  it('keeps Save disabled until the text changes', async () => {
    await create('Azure hosting');
    const save = () => el.querySelector('#save-hint') as HTMLButtonElement;
    expect(save().disabled).toBeTrue();

    component.text = 'Azure hosting and domains';
    await render();

    expect(save().disabled).toBeFalse();
  });

  it('explains that earlier classifications are not redone', async () => {
    await create(null);

    expect(el.textContent).toContain("Transactions already classified aren't redone");
  });

  it('shows an error with a way to try again when the hint cannot be loaded', async () => {
    api.getAiClassificationHint.and.returnValue(throwError(() => ({ status: 500 })));
    fixture = TestBed.createComponent(AccountAiHintModalComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    await render();

    expect(el.querySelector('.alert-danger')?.textContent).toContain('Could not load the hint.');
    expect(el.querySelector('.alert-danger button')).not.toBeNull();
    expect((el.querySelector('#ai-hint-text') as HTMLTextAreaElement).disabled).toBeTrue();
  });
});
