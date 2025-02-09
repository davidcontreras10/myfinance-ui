import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { MainViewComponent } from './main-view/main-view.component';
import { LoginGuard } from './login.guard';
import { AccountsComponent } from './accounts/accounts.component';
import { AutomaticTasksComponent } from './automatic-tasks/automatic-tasks.component';
import { NewScheduledTaskComponent } from './automatic-tasks/new-scheduled-task/new-scheduled-task.component';
import { NewAccountComponent } from './new-account/new-account.component';
import { TransactionTypesComponent } from './transaction-types/transaction-types.component';
import { BankTransactionsComponent } from './main-view/bank-transactions/bank-transactions.component';
import { DebtManagerComponent } from './debt-manager/debt-manager.component';
import { MenuPageComponent } from './menu-page/menu-page.component';

const routes: Routes = [
  { path: '', component: MenuPageComponent, canActivate: [AuthGuard] },
  { path: 'finance', component: MainViewComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard] },
  {
    path: 'accounts/new',
    component: NewAccountComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'accounts/edit/:accountId',
    component: NewAccountComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'scheduled-tasks',
    component: AutomaticTasksComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'scheduled-tasks/new',
    component: NewScheduledTaskComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transaction-types',
    component: TransactionTypesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'bank-trx',
    component: BankTransactionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'debt-manager',
    component: DebtManagerComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
