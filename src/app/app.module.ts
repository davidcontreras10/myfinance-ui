import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbDropdownModule, NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
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
    ErrorModalComponent
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
    ReactiveFormsModule
  ],
  providers: [
    MainSpinnerService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpSpinnerInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpNotifyInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
