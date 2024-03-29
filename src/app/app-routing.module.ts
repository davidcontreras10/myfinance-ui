import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { MainViewComponent } from './main-view/main-view.component';
import { LoginGuard } from './login.guard';
import { AccountsComponent } from './accounts/accounts.component';
import { AutomaticTasksComponent } from './automatic-tasks/automatic-tasks.component';
import { NewScheduledTaskComponent } from './automatic-tasks/new-scheduled-task/new-scheduled-task.component';

const routes: Routes = [
  { path: '', component: MainViewComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard] },
  { path: 'scheduled-tasks', component: AutomaticTasksComponent, canActivate: [AuthGuard] },
  { path: 'scheduled-tasks/new', component: NewScheduledTaskComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
