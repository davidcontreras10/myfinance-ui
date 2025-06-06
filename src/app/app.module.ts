import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbDropdownModule, NgbModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from './login/login.component';
import { MainViewComponent } from './main-view/main-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MainNavBarComponent } from './main-nav-bar/main-nav-bar.component';
import { NavBarMenuComponent } from './main-nav-bar/nav-bar-menu/nav-bar-menu.component';
import { AccountsComponent } from './accounts/accounts.component';
import { MainSpinnerComponent } from './main-spinner/main-spinner.component';
import { CoreSpinnerComponent } from './core-spinner/core-spinner.component';
import { MainSpinnerService } from './services/main-spinner.service';
import { HttpSpinnerInterceptor } from './interceptors/HttpSpinnerInterceptor';
import { AccountsAccordeonComponent } from './main-view/accounts-accordeon/accounts-accordeon.component';
import { AccGroupComponent } from './main-view/acc-group/acc-group.component';
import { HttpTokenInterceptor } from './interceptors/HttpTokenInterceptor';
import { ClickOutsideDirective } from './clickOutside.directive';
import { AccountViewComponent } from './main-view/account-view/account-view.component';
import { TrxAmountComponent } from './main-view/trx-amount/trx-amount.component';
import { CurrencyAmountPipe } from './currency-amount.pipe';
import { BsIconComponent } from './bs-icon/bs-icon.component';
import { BankSummaryComponent } from './main-view/bank-summary/bank-summary.component';
import { HttpNotifyInterceptor } from './interceptors/http-notify.interceptor';
import { AddTrxComponent } from './main-view/add-trx/add-trx.component';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ViewTrxComponent } from './main-view/view-trx/view-trx.component';
import { TransferViewComponent } from './main-view/transfer-view/transfer-view.component';
import { ErrorModalComponent } from './error-modal/error-modal.component';
import { AccountNotesComponent } from './main-view/account-notes/account-notes.component';
import { MainViewPrefsComponent } from './main-view/main-view-prefs/main-view-prefs.component';
import { AutomaticTasksComponent } from './automatic-tasks/automatic-tasks.component';
import { TasksListComponent } from './automatic-tasks/tasks-list/tasks-list.component';
import { TaskDetailComponent } from './automatic-tasks/task-detail/task-detail.component';
import { TaskStatusComponent } from './automatic-tasks/task-status/task-status.component';
import { ExecutedTasksComponent } from './automatic-tasks/executed-tasks/executed-tasks.component';
import { NewScheduledTaskComponent } from './automatic-tasks/new-scheduled-task/new-scheduled-task.component';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { DraggableGridComponent } from './draggable-grid/draggable-grid.component';
import { AccountsGroupsComponent } from './accounts/accounts-groups/accounts-groups.component';
import { NewAccountComponent } from './new-account/new-account.component';
import { TransactionTypesComponent } from './transaction-types/transaction-types.component';
import { TransactionTypesTableComponent } from './transaction-types/transaction-types-table/transaction-types-table.component';
import { NewTransactionTypeComponent } from './transaction-types/new-transaction-type/new-transaction-type.component';
import { TrxTableComponent } from './main-view/account-view/trx-table/trx-table.component';
import { TrxFilterModalComponent } from './main-view/account-view/trx-filter-modal/trx-filter-modal.component';
import { DatePipe } from '@angular/common';
import { SetPeriodDateComponent } from './main-view/set-period-date/set-period-date.component';
import { BankTransactionsComponent } from './main-view/bank-transactions/bank-transactions.component';
import { BankTransactionsModalComponent } from './main-view/bank-transactions/bank-transactions-modal/bank-transactions-modal.component';
import { BankTrxMultipleComponent } from './main-view/bank-transactions/bank-trx-multiple/bank-trx-multiple.component';
import { DebtManagerComponent } from './debt-manager/debt-manager.component';
import { DebtManagerModalComponent } from './debt-manager/debt-manager-modal/debt-manager-modal.component';
import { SubmittedDebtRequestsComponent } from './debt-manager/submitted-debt-requests/submitted-debt-requests.component';
import { NewDebtRequestComponent } from './debt-manager/new-debt-request/new-debt-request.component';
import { ActionsComponent } from './debt-manager/submitted-debt-requests/actions/actions.component';
import { ReceivedRequestsComponent } from './debt-manager/received-requests/received-requests.component';
import { DebtorActionsComponent } from './debt-manager/received-requests/actions/debtor-actions.component';
import { MenuPageComponent } from './menu-page/menu-page.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainViewComponent,
    MainNavBarComponent,
    NavBarMenuComponent,
    AccountsComponent,
    MainSpinnerComponent,
    CoreSpinnerComponent,
    AccountsAccordeonComponent,
    AccGroupComponent,
    ClickOutsideDirective,
    AccountViewComponent,
    TrxAmountComponent,
    CurrencyAmountPipe,
    BsIconComponent,
    BankSummaryComponent,
    AddTrxComponent,
    ViewTrxComponent,
    TransferViewComponent,
    ErrorModalComponent,
    AccountNotesComponent,
    MainViewPrefsComponent,
    AutomaticTasksComponent,
    TasksListComponent,
    TaskDetailComponent,
    TaskStatusComponent,
    ExecutedTasksComponent,
    NewScheduledTaskComponent,
    DraggableGridComponent,
    AccountsGroupsComponent,
    NewAccountComponent,
    TransactionTypesComponent,
    TransactionTypesTableComponent,
    NewTransactionTypeComponent,
    TrxTableComponent,
    TrxFilterModalComponent,
    SetPeriodDateComponent,
    BankTransactionsComponent,
    BankTransactionsModalComponent,
    BankTrxMultipleComponent,
    DebtManagerComponent,
    DebtManagerModalComponent,
    SubmittedDebtRequestsComponent,
    NewDebtRequestComponent,
    ActionsComponent,
    ReceivedRequestsComponent,
    DebtorActionsComponent,
    MenuPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    NgbDropdownModule,
    NgbNavModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    DragDropModule
  ],
  providers: [
    DatePipe,
    MainSpinnerService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpSpinnerInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpNotifyInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
