import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogInComponent } from './log-in/log-in.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterOptionsComponent } from './register-options/register-options.component';
import { AuthGuardService as AuthGuard } from './_services/auth-guard.service';
import { RegisterMechanicComponent } from './register-mechanic/register-mechanic.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  //{ path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, Protected by auth guard
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LogInComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'registeroption', component: RegisterOptionsComponent },
  { path: 'registermch', component: RegisterMechanicComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
