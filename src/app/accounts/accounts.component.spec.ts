import { AccountsComponent } from './accounts.component';
import { AccountAiHintModalComponent } from './account-ai-hint-modal/account-ai-hint-modal.component';

// No TestBed here: these tests exercise the component's logic directly, so they don't depend on the
// template or on the HTTP/router providers.
describe('AccountsComponent AI hint', () => {
  let modalService: jasmine.SpyObj<any>;
  let component: AccountsComponent;
  let modalInstance: { accountId?: number; accountName?: string };

  const openWith = (result: Promise<any>) => {
    modalInstance = {};
    modalService.open.and.returnValue({ componentInstance: modalInstance, result });
  };

  beforeEach(() => {
    modalService = jasmine.createSpyObj('NgbModal', ['open']);
    component = new AccountsComponent({} as any, {} as any, modalService, {} as any, {} as any, {} as any);
  });

  it('opens the modal for the account, passing its id and name', () => {
    openWith(new Promise(() => { }));

    component.openAiHint(7, 'Ingresos Ahorros', { hasAiClassificationHint: false });

    expect(modalService.open).toHaveBeenCalledWith(AccountAiHintModalComponent, jasmine.objectContaining({ size: 'lg' }));
    expect(modalInstance.accountId).toBe(7);
    expect(modalInstance.accountName).toBe('Ingresos Ahorros');
  });

  it('marks the account as having a hint when the modal saves one', async () => {
    const account = { hasAiClassificationHint: false };
    openWith(Promise.resolve({ accountId: 7, hasHint: true }));

    component.openAiHint(7, 'Ingresos Ahorros', account);
    await Promise.resolve();

    expect(account.hasAiClassificationHint).toBeTrue();
  });

  it('clears the flag when the modal clears the hint', async () => {
    const account = { hasAiClassificationHint: true };
    openWith(Promise.resolve({ accountId: 7, hasHint: false }));

    component.openAiHint(7, 'Ingresos Ahorros', account);
    await Promise.resolve();

    expect(account.hasAiClassificationHint).toBeFalse();
  });

  it('leaves the flag alone when the modal is dismissed', async () => {
    const account = { hasAiClassificationHint: true };
    openWith(Promise.reject('Cancel'));

    component.openAiHint(7, 'Ingresos Ahorros', account);
    await new Promise((resolve) => setTimeout(resolve));

    expect(account.hasAiClassificationHint).toBeTrue();
  });
});
